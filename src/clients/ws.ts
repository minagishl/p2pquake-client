import { EventEmitter } from 'events';
import { P2PQuakeEvent, EventCode, EventTypeMap } from '../types/events';
import { DEFAULT_RECONNECT_CONFIG, WS_ENDPOINTS } from '../types/constants';
import { Deduplicator } from '../utils/deduplicator';
import { ReconnectManager, ReconnectConfig } from '../utils/reconnect';
import { isP2PQuakeEvent } from '../utils/validator';
import { ConnectionError, ValidationError, ReconnectError } from '../errors';
import { WebSocketLike, WebSocketMessageData, createWebSocket } from '../utils/websocket';

/**
 * WebSocket client configuration options
 */
export interface WebSocketClientOptions {
  /** WebSocket endpoint URL (default: WS_ENDPOINTS.PRODUCTION) */
  url?: string;

  /** Enable automatic reconnection (default: true) */
  autoReconnect?: boolean;

  /** Reconnection configuration */
  reconnect?: Partial<ReconnectConfig>;

  /** Filter events by code (default: all events) */
  eventCodes?: EventCode[];

  /** Deduplication window in milliseconds (default: 60000) */
  deduplicationWindow?: number;

  /** WebSocket options */
  websocket?: {
    /** WebSocket protocols */
    protocols?: string | string[];
    /** Additional headers */
    headers?: Record<string, string>;
  };
}

/**
 * Internal resolved options type
 */
interface ResolvedWebSocketClientOptions {
  url: string;
  autoReconnect: boolean;
  reconnect: ReconnectConfig;
  eventCodes: EventCode[];
  deduplicationWindow: number;
  websocket: {
    protocols?: string | string[];
    headers?: Record<string, string>;
  };
}

/**
 * P2P Quake WebSocket client
 *
 * Provides a type-safe interface to the P2P Quake earthquake information API.
 * Features automatic reconnection, event deduplication, and type-safe event handlers.
 *
 * @example
 * ```typescript
 * const client = new P2PQuakeWebSocketClient({
 *   url: WS_ENDPOINTS.PRODUCTION,
 *   autoReconnect: true,
 *   eventCodes: [551, 556], // Only earthquake and EEW
 * });
 *
 * client.on(551, (earthquake) => {
 *   console.log(`Earthquake M${earthquake.earthquake.hypocenter.magnitude}`);
 * });
 *
 * await client.connect();
 * ```
 */
export class P2PQuakeWebSocketClient extends EventEmitter {
  private ws: WebSocketLike | null = null;
  private deduplicator: Deduplicator;
  private reconnectManager: ReconnectManager;
  private options: ResolvedWebSocketClientOptions;
  private intentionalDisconnect = false;
  private isConnecting = false;

  /**
   * Create a new P2P Quake WebSocket client
   *
   * @param options - Client configuration options
   */
  constructor(options: WebSocketClientOptions = {}) {
    super();

    // Merge options with defaults
    const reconnectConfig: ReconnectConfig = {
      ...DEFAULT_RECONNECT_CONFIG,
      ...options.reconnect,
    };

    this.options = {
      url: options.url ?? WS_ENDPOINTS.PRODUCTION,
      autoReconnect: options.autoReconnect ?? true,
      reconnect: reconnectConfig,
      eventCodes: options.eventCodes ?? [551, 552, 554, 555, 556, 561, 9611],
      deduplicationWindow: options.deduplicationWindow ?? 60000,
      websocket: options.websocket ?? {},
    };

    // Initialize utilities
    this.deduplicator = new Deduplicator(this.options.deduplicationWindow);
    this.reconnectManager = new ReconnectManager(this.options.reconnect);
  }

  /**
   * Connect to the WebSocket endpoint
   *
   * @returns Promise that resolves when connection is established
   * @throws {ConnectionError} If connection fails
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new ConnectionError('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.intentionalDisconnect = false;

      try {
        this.setupWebSocket();

        // Set up one-time listeners for connection result
        const onOpen = () => {
          cleanup();
          this.isConnecting = false;
          resolve();
        };

        const onError = (error: Error) => {
          cleanup();
          this.isConnecting = false;
          reject(new ConnectionError(`Failed to connect: ${error.message}`));
        };

        const cleanup = () => {
          this.off('connect', onOpen);
          this.off('error', onError);
        };

        this.once('connect', onOpen);
        this.once('error', onError);
      } catch (error) {
        this.isConnecting = false;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Disconnect from the WebSocket
   *
   * This will not trigger automatic reconnection
   */
  public disconnect(): void {
    this.intentionalDisconnect = true;
    this.reconnectManager.cancel();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get current connection state
   */
  public get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === this.ws.OPEN;
  }

  /**
   * Clean up all resources
   *
   * Closes the connection, clears all event listeners, and stops all timers
   */
  public destroy(): void {
    this.disconnect();
    this.deduplicator.destroy();
    this.reconnectManager.cancel();
    this.removeAllListeners();
  }

  /**
   * Type-safe event listener registration
   */
  public on<T extends EventCode>(event: T, listener: (data: EventTypeMap[T]) => void): this;
  public on(event: 'connect', listener: () => void): this;
  public on(event: 'disconnect', listener: (code: number, reason: string) => void): this;
  public on(event: 'error', listener: (error: Error) => void): this;
  public on(event: 'reconnecting', listener: (attempt: number, delay: number) => void): this;
  public on(event: 'data', listener: (data: P2PQuakeEvent) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string | number, listener: (...args: any[]) => void): this {
    return super.on(String(event), listener);
  }

  /**
   * Set up WebSocket connection and event handlers
   */
  private setupWebSocket(): void {
    const { url, websocket } = this.options;

    this.ws = createWebSocket(url, websocket);

    this.ws.on('open', () => this.handleOpen());
    this.ws.on('message', (data) => this.handleMessage(data));
    this.ws.on('close', (code, reason) => this.handleClose(code, reason));
    this.ws.on('error', (error) => this.handleError(error));
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.reconnectManager.reset();
    this.emit('connect');
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(data: WebSocketMessageData): void {
    try {
      // Parse JSON
      const message = JSON.parse(this.normalizeMessageData(data));

      // Normalize _id to id (API returns _id but we expect id)
      if (
        '_id' in message &&
        typeof (message as { _id?: unknown })._id === 'string' &&
        !('id' in message)
      ) {
        (message as { id: string }).id = (message as { _id: string })._id;
        delete (message as { _id?: string })._id;
      }

      // Validate basic structure
      if (!isP2PQuakeEvent(message)) {
        throw new ValidationError('Invalid event structure', message);
      }

      // Check deduplication
      if (this.deduplicator.isDuplicate(message.id)) {
        return; // Skip duplicate
      }

      // Check event code filter
      if (!this.options.eventCodes.includes(message.code)) {
        return; // Skip filtered event
      }

      // Emit specific event type
      this.emit(String(message.code), message);

      // Emit generic data event
      this.emit('data', message);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.emit('error', error);
      } else if (error instanceof Error) {
        this.emit('error', new ValidationError(`Failed to parse message: ${error.message}`, data));
      }
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(code: number, reason: Buffer | string): void {
    this.ws = null;
    const reasonString = typeof reason === 'string' ? reason : reason.toString();

    this.emit('disconnect', code, reasonString);

    // Attempt reconnection if not intentional
    if (!this.intentionalDisconnect && this.options.autoReconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: Error): void {
    this.emit('error', new ConnectionError(error.message));
  }

  private normalizeMessageData(data: WebSocketMessageData): string {
    if (typeof data === 'string') {
      return data;
    }
    if (Buffer.isBuffer(data)) {
      return data.toString();
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(data).toString();
    }
    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString();
    }
    if (Array.isArray(data)) {
      const buffers = (data as Array<Buffer | ArrayBuffer | ArrayBufferView | string>).map(
        (chunk) => {
          if (typeof chunk === 'string') {
            return Buffer.from(chunk);
          }
          if (Buffer.isBuffer(chunk)) {
            return chunk;
          }
          if (ArrayBuffer.isView(chunk)) {
            return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
          }
          return Buffer.from(chunk);
        }
      );
      return Buffer.concat(buffers).toString();
    }
    return data === undefined || data === null ? '' : String(data);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.reconnectManager.shouldReconnect()) {
      const error = new ReconnectError(
        'Maximum reconnection attempts reached',
        this.reconnectManager.attemptCount
      );
      this.emit('error', error);
      return;
    }

    const delay = this.reconnectManager.getNextDelay();
    const attempt = this.reconnectManager.attemptCount + 1;

    this.emit('reconnecting', attempt, delay);

    this.reconnectManager.scheduleReconnect(() => {
      if (!this.intentionalDisconnect) {
        this.connect().catch((error) => {
          this.emit('error', error);
          // Will retry again through handleClose
        });
      }
    });
  }
}
