/**
 * Basic usage example for P2P Quake WebSocket client
 *
 * This example demonstrates:
 * - Connecting to the production WebSocket
 * - Listening for earthquake events
 * - Handling connection events
 */

import { P2PQuakeWebSocketClient } from 'p2pquake-client';

async function main() {
  // Create client instance (uses production endpoint by default)
  const client = new P2PQuakeWebSocketClient();

  // Listen for JMA Earthquake Information (Code 551)
  client.on(551, (earthquake) => {
    console.log('\n=== Earthquake Detected ===');
    console.log(`Time: ${earthquake.earthquake.time}`);
    console.log(`Location: ${earthquake.earthquake.hypocenter.name}`);
    console.log(`Magnitude: ${earthquake.earthquake.hypocenter.magnitude}`);
    console.log(`Max Intensity: ${earthquake.earthquake.maxScale}`);
    console.log(`Depth: ${earthquake.earthquake.hypocenter.depth}km`);
    console.log(`Tsunami: ${earthquake.earthquake.domesticTsunami}`);

    // Show observation points
    if (earthquake.points && earthquake.points.length > 0) {
      console.log('\nObservation Points:');
      earthquake.points.slice(0, 5).forEach((point) => {
        console.log(`  ${point.pref} ${point.addr}: ${point.scale}`);
      });
      if (earthquake.points.length > 5) {
        console.log(`  ... and ${earthquake.points.length - 5} more`);
      }
    }
  });

  // Listen for Early Earthquake Warning (Code 556)
  client.on(556, (eew) => {
    console.log('\n=== Early Earthquake Warning ===');
    console.log(`Location: ${eew.earthquake.hypocenter.name}`);
    console.log(`Magnitude: ${eew.earthquake.hypocenter.magnitude}`);
    console.log(`Origin Time: ${eew.earthquake.originTime}`);
    console.log(`Event ID: ${eew.issue.eventId}`);
    console.log(`Test: ${eew.test ? 'Yes' : 'No'}`);
  });

  // Listen for connection events
  client.on('connect', () => {
    console.log('✓ Connected to P2P Quake');
  });

  client.on('disconnect', (code, reason) => {
    console.log(`✗ Disconnected: ${code} - ${reason}`);
  });

  client.on('error', (error) => {
    console.error('Error:', error.message);
  });

  client.on('reconnecting', (attempt, delay) => {
    console.log(`⟳ Reconnecting (attempt ${attempt}) in ${delay}ms`);
  });

  // Connect to WebSocket
  try {
    await client.connect();
    console.log('Listening for earthquake events...\n');
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    client.destroy();
    process.exit(0);
  });
}

main();
