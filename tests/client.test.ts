import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { P2PQuakeWebSocketClient } from '../src/clients/ws';
import { WS_ENDPOINTS, buildRestUrl, getRestBaseUrl } from '../src/types/constants';

describe('P2PQuakeWebSocketClient', () => {
  let client: P2PQuakeWebSocketClient;

  beforeEach(() => {
    client = new P2PQuakeWebSocketClient({
      url: WS_ENDPOINTS.PRODUCTION,
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
      url: WS_ENDPOINTS.PRODUCTION,
      eventCodes: [551], // Only JMA Quake events
    });

    expect(filteredClient).toBeDefined();
  });

  it('should allow custom reconnection configuration', () => {
    const reconnectClient = new P2PQuakeWebSocketClient({
      url: WS_ENDPOINTS.PRODUCTION,
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
      url: WS_ENDPOINTS.PRODUCTION,
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
      url: WS_ENDPOINTS.PRODUCTION,
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

describe('REST_ENDPOINTS helpers', () => {
  describe('buildRestUrl', () => {
    it('should return base URL when no path is provided', () => {
      expect(buildRestUrl('PRODUCTION')).toBe('https://api.p2pquake.net/v2');
      expect(buildRestUrl('SANDBOX')).toBe('https://api-sandbox.p2pquake.net/v2');
    });

    it('should build URL with static path', () => {
      expect(buildRestUrl('PRODUCTION', 'JMA_QUAKE')).toBe('https://api.p2pquake.net/v2/jma/quake');
      expect(buildRestUrl('PRODUCTION', 'JMA_TSUNAMI')).toBe(
        'https://api.p2pquake.net/v2/jma/tsunami'
      );
      expect(buildRestUrl('SANDBOX', 'JMA_QUAKE')).toBe(
        'https://api-sandbox.p2pquake.net/v2/jma/quake'
      );
    });

    it('should build URL with dynamic path (by ID)', () => {
      expect(buildRestUrl('PRODUCTION', 'JMA_QUAKE_BY_ID', '20240101120000')).toBe(
        'https://api.p2pquake.net/v2/jma/quake/20240101120000'
      );
      expect(buildRestUrl('PRODUCTION', 'JMA_TSUNAMI_BY_ID', '20240101120000')).toBe(
        'https://api.p2pquake.net/v2/jma/tsunami/20240101120000'
      );
      expect(buildRestUrl('SANDBOX', 'JMA_QUAKE_BY_ID', 'test123')).toBe(
        'https://api-sandbox.p2pquake.net/v2/jma/quake/test123'
      );
    });

    it('should throw error when ID is required but not provided', () => {
      expect(() => buildRestUrl('PRODUCTION', 'JMA_QUAKE_BY_ID')).toThrow(
        'ID is required for path: JMA_QUAKE_BY_ID'
      );
      expect(() => buildRestUrl('PRODUCTION', 'JMA_TSUNAMI_BY_ID')).toThrow(
        'ID is required for path: JMA_TSUNAMI_BY_ID'
      );
    });
  });

  describe('getRestBaseUrl', () => {
    it('should return correct base URL for PRODUCTION', () => {
      expect(getRestBaseUrl('PRODUCTION')).toBe('https://api.p2pquake.net/v2');
    });

    it('should return correct base URL for SANDBOX', () => {
      expect(getRestBaseUrl('SANDBOX')).toBe('https://api-sandbox.p2pquake.net/v2');
    });
  });
});
