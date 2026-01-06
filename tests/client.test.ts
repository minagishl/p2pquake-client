import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { P2PQuakeWebSocketClient } from '../src/clients/ws';
import { ENDPOINTS } from '../src/types/constants';

describe('P2PQuakeWebSocketClient', () => {
  let client: P2PQuakeWebSocketClient;

  beforeEach(() => {
    client = new P2PQuakeWebSocketClient({
      url: ENDPOINTS.PRODUCTION,
      autoReconnect: false, // Disable for testing
    });
  });

  it('should create client instance', () => {
    expect(client).toBeDefined();
    expect(client.isConnected).toBe(false);
  });

  it('should accept custom options', () => {
    const customClient = new P2PQuakeWebSocketClient({
      url: 'wss://custom.example.com/ws',
      autoReconnect: true,
      eventCodes: [551, 556],
      deduplicationWindow: 30000,
    });

    expect(customClient).toBeDefined();
    expect(customClient.isConnected).toBe(false);
  });

  it('should register event listeners', () => {
    const listener = mock(() => {});

    client.on(551, listener);
    client.on('connect', listener);
    client.on('disconnect', listener);
    client.on('error', listener);
    client.on('data', listener);

    // Listeners should be registered
    expect(client.listenerCount('551')).toBe(1);
    expect(client.listenerCount('connect')).toBe(1);
  });

  it('should clean up resources on destroy', () => {
    const listener = mock(() => {});

    client.on(551, listener);
    client.on('connect', listener);

    expect(client.listenerCount('551')).toBe(1);

    client.destroy();

    // All listeners should be removed
    expect(client.listenerCount('551')).toBe(0);
    expect(client.listenerCount('connect')).toBe(0);
  });

  it('should handle event code filtering', () => {
    const filteredClient = new P2PQuakeWebSocketClient({
      url: ENDPOINTS.PRODUCTION,
      eventCodes: [551], // Only JMA Quake events
    });

    expect(filteredClient).toBeDefined();
  });

  it('should allow custom reconnection configuration', () => {
    const reconnectClient = new P2PQuakeWebSocketClient({
      url: ENDPOINTS.PRODUCTION,
      autoReconnect: true,
      reconnect: {
        initialDelay: 2000,
        maxDelay: 60000,
        multiplier: 3,
        maxAttempts: 10,
      },
    });

    expect(reconnectClient).toBeDefined();
  });

  it('should support custom WebSocket headers', () => {
    const headerClient = new P2PQuakeWebSocketClient({
      url: ENDPOINTS.PRODUCTION,
      websocket: {
        headers: {
          'X-API-Key': 'test-key',
          'User-Agent': 'test-agent',
        },
      },
    });

    expect(headerClient).toBeDefined();
  });

  it('should disconnect cleanly', () => {
    client.disconnect();
    expect(client.isConnected).toBe(false);
  });
});

describe('P2PQuakeWebSocketClient Type Safety', () => {
  it('should provide type-safe event handlers', () => {
    const client = new P2PQuakeWebSocketClient({
      url: ENDPOINTS.PRODUCTION,
    });

    // Type checking at compile time - these should not cause TypeScript errors
    client.on(551, (earthquake) => {
      // earthquake is typed as JMAQuake
      expect(earthquake.code).toBe(551);
      expect(earthquake.earthquake).toBeDefined();
    });

    client.on(556, (eew) => {
      // eew is typed as EEW
      expect(eew.code).toBe(556);
      expect(eew.earthquake).toBeDefined();
    });

    client.on('data', (event) => {
      // event is P2PQuakeEvent union type
      expect(event.code).toBeDefined();
      expect(event.id).toBeDefined();
    });

    client.destroy();
  });
});
