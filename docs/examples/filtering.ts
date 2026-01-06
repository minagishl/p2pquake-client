/**
 * Event filtering example for P2P Quake WebSocket client
 *
 * This example demonstrates:
 * - Filtering events by event code
 * - Type-safe event handlers
 * - Using discriminated unions
 */

import { P2PQuakeWebSocketClient } from 'p2pquake-client';

async function main() {
  // Create client that only listens for specific event types
  const client = new P2PQuakeWebSocketClient({
    // Only receive JMA Quake (551) and EEW (556) events
    eventCodes: [551, 556],
  });

  // Type-safe handler for JMA Quake events
  client.on(551, (earthquake) => {
    // earthquake is typed as JMAQuake
    console.log('Earthquake:', {
      magnitude: earthquake.earthquake.hypocenter.magnitude,
      location: earthquake.earthquake.hypocenter.name,
      intensity: earthquake.earthquake.maxScale,
    });
  });

  // Type-safe handler for EEW events
  client.on(556, (eew) => {
    // eew is typed as EEW
    console.log('EEW:', {
      magnitude: eew.earthquake.hypocenter.magnitude,
      location: eew.earthquake.hypocenter.name,
      isTest: eew.test,
    });
  });

  // Generic data handler (receives all events)
  client.on('data', (event) => {
    // Use discriminated union to narrow the type
    switch (event.code) {
      case 551:
        // event is now typed as JMAQuake
        console.log(`JMA Quake: M${event.earthquake.hypocenter.magnitude}`);
        break;
      case 556:
        // event is now typed as EEW
        console.log(`EEW: ${event.earthquake.hypocenter.name}`);
        break;
    }
  });

  // Connect to WebSocket
  await client.connect();
  console.log('Listening for filtered events (551, 556 only)...\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    client.destroy();
    process.exit(0);
  });
}

main();
