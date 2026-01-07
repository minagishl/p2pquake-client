import WebSocket from 'ws';

export type WebSocketMessageData = string | Buffer | ArrayBuffer | Buffer[];

export interface WebSocketLike {
  readonly OPEN: number;
  readyState: number;
  close(code?: number, reason?: string): void;
  on(event: 'open', listener: () => void): void;
  on(event: 'message', listener: (data: WebSocketMessageData) => void): void;
  on(event: 'close', listener: (code: number, reason: Buffer | string) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
}

interface WebSocketOptions {
  protocols?: string | string[];
  headers?: Record<string, string>;
}

function isBunRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean((process as NodeJS.Process).versions?.bun);
}

function hasNativeWebSocket(): boolean {
  return typeof globalThis.WebSocket === 'function';
}

/**
 * Create a WebSocket instance that works in Node.js and Bun.
 * In Bun we prefer the native WebSocket to avoid Node-compat quirks in `ws`.
 */
export function createWebSocket(url: string, options: WebSocketOptions = {}): WebSocketLike {
  if (isBunRuntime() && hasNativeWebSocket()) {
    return createNativeWebSocket(url, options.protocols);
  }

  const ws = new WebSocket(url, options.protocols, {
    headers: options.headers,
  });

  const nodeLike = ws as WebSocketLike & typeof ws;

  Object.defineProperty(nodeLike, 'OPEN', {
    value: WebSocket.OPEN,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  return nodeLike;
}

type NativeMessageEvent = { data: unknown };
type NativeCloseEvent = { code?: number; reason?: string };
type NativeErrorEvent = { error?: unknown };

function createNativeWebSocket(url: string, protocols?: string | string[]): WebSocketLike {
  const NativeWS = globalThis.WebSocket;
  const ws = new NativeWS(url, protocols);

  const openListeners = new Set<() => void>();
  const messageListeners = new Set<(data: WebSocketMessageData) => void>();
  const closeListeners = new Set<(code: number, reason: Buffer | string) => void>();
  const errorListeners = new Set<(error: Error) => void>();

  ws.addEventListener('open', () => {
    openListeners.forEach((listener) => listener());
  });

  ws.addEventListener('message', (event: Event) => {
    const payload = (event as unknown as NativeMessageEvent).data as WebSocketMessageData;
    messageListeners.forEach((listener) => listener(payload));
  });

  ws.addEventListener('close', (event: Event) => {
    const closeEvent = event as NativeCloseEvent;
    const code = typeof closeEvent.code === 'number' ? closeEvent.code : 0;
    const reason = typeof closeEvent.reason === 'string' ? closeEvent.reason : '';
    closeListeners.forEach((listener) => listener(code, Buffer.from(reason)));
  });

  ws.addEventListener('error', (event: Event) => {
    const nativeEvent = event as NativeErrorEvent;
    const error =
      nativeEvent && 'error' in nativeEvent && nativeEvent.error instanceof Error
        ? (nativeEvent.error as Error)
        : new Error('WebSocket error');
    errorListeners.forEach((listener) => listener(error));
  });

  return {
    get OPEN() {
      return NativeWS.OPEN;
    },
    get readyState() {
      return ws.readyState;
    },
    close(code?: number, reason?: string) {
      ws.close(code, reason);
    },
    on(event, listener) {
      switch (event) {
        case 'open':
          openListeners.add(listener as () => void);
          break;
        case 'message':
          messageListeners.add(listener as (data: WebSocketMessageData) => void);
          break;
        case 'close':
          closeListeners.add(listener as (code: number, reason: Buffer | string) => void);
          break;
        case 'error':
          errorListeners.add(listener as (error: Error) => void);
          break;
        default:
          break;
      }
    },
  };
}
