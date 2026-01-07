/**
 * Custom endpoint example for P2P Quake WebSocket client
 *
 * This example demonstrates:
 * - Using the sandbox environment
 * - Using a custom WebSocket URL
 * - Configuring reconnection behavior
 */

import { P2PQuakeWebSocketClient, WS_ENDPOINTS } from 'p2pquake-client';

async function useSandbox() {
  console.log('=== Sandbox Environment ===\n');

  const client = new P2PQuakeWebSocketClient({
    url: WS_ENDPOINTS.SANDBOX,
  });

  client.on('connect', () => {
    console.log('Connected to sandbox environment');
  });

  client.on('data', (event) => {
    console.log(`Received event ${event.code}:`, event.id);
  });

  await client.connect();

  // Cleanup after 10 seconds
  setTimeout(() => {
    console.log('Disconnecting from sandbox...\n');
    client.destroy();
    useCustomEndpoint();
  }, 10000);
}

async function useCustomEndpoint() {
  console.log('=== Custom Endpoint ===\n');

  const client = new P2PQuakeWebSocketClient({
    // Use your own WebSocket endpoint
    url: 'wss://your-custom-endpoint.example.com/ws',

    // Configure reconnection behavior
    autoReconnect: true,
    reconnect: {
      initialDelay: 2000, // Start with 2 seconds
      maxDelay: 60000, // Cap at 60 seconds
      multiplier: 2, // Double delay each attempt
      maxAttempts: 5, // Give up after 5 attempts
    },

    // Add custom headers
    websocket: {
      headers: {
        'X-API-Key': 'your-api-key',
        'User-Agent': 'p2pquake-client/1.0.0',
      },
    },
  });

  client.on('connect', () => {
    console.log('Connected to custom endpoint');
  });

  client.on('reconnecting', (attempt, delay) => {
    console.log(`Reconnection attempt ${attempt} in ${delay}ms`);
  });

  client.on('error', (error) => {
    console.error('Error:', error.message);

    // Check error type
    if (error.name === 'ReconnectError') {
      console.log('Max reconnection attempts reached');
      client.destroy();
      process.exit(1);
    }
  });

  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to custom endpoint:', error);
    process.exit(1);
  }
}

// Start with sandbox example
useSandbox();
