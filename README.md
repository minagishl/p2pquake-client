# P2P Quake Client

Type-safe WebSocket client for [P2P Quake](https://www.p2pquake.net/) earthquake information API.

## Features

- **Type-Safe**: Full TypeScript support with discriminated unions for all event types
- **Auto-Reconnect**: Exponential backoff reconnection strategy
- **Deduplication**: Automatic filtering of duplicate events
- **Event Filtering**: Subscribe to specific event types
- **Custom Endpoints**: Support for production, sandbox, or custom WebSocket URLs
- **Memory-Safe**: Proper cleanup and resource management
- **Zero Config**: Works out of the box with sensible defaults

## Installation

```bash
# Using Bun
bun add p2pquake-client

# Using npm
npm install p2pquake-client

# Using yarn
yarn add p2pquake-client

# Using pnpm
pnpm add p2pquake-client
```

## Quick Start

```typescript
import { P2PQuakeWebSocketClient } from 'p2pquake-client';

// Create client (uses production endpoint by default)
const client = new P2PQuakeWebSocketClient();

// Listen for earthquake information (Code 551)
client.on(551, (earthquake) => {
  console.log(`Earthquake detected!`);
  console.log(`Magnitude: ${earthquake.earthquake.hypocenter.magnitude}`);
  console.log(`Max Intensity: ${earthquake.earthquake.maxScale}`);
  console.log(`Location: ${earthquake.earthquake.hypocenter.name}`);
});

// Listen for Early Earthquake Warning (Code 556)
client.on(556, (eew) => {
  console.log(`EEW: ${eew.earthquake.hypocenter.name}`);
  console.log(`Magnitude: ${eew.earthquake.hypocenter.magnitude}`);
});

// Listen for connection events
client.on('connect', () => {
  console.log('Connected to P2P Quake');
});

client.on('disconnect', (code, reason) => {
  console.log(`Disconnected: ${code} - ${reason}`);
});

client.on('error', (error) => {
  console.error('Error:', error);
});

// Connect to WebSocket
await client.connect();
```

## Usage Examples

### Event Filtering

Subscribe only to specific event types:

```typescript
const client = new P2PQuakeWebSocketClient({
  eventCodes: [551, 556], // Only JMA Quake and EEW
});

client.on(551, (earthquake) => {
  // Handle earthquake information
});

client.on(556, (eew) => {
  // Handle early earthquake warning
});
```

### Custom WebSocket URL

Use the sandbox environment or your own endpoint:

```typescript
// Sandbox environment
const sandboxClient = new P2PQuakeWebSocketClient({
  url: ENDPOINTS.SANDBOX,
});

// Custom endpoint
const customClient = new P2PQuakeWebSocketClient({
  url: 'wss://your-custom-endpoint.example.com/ws',
});
```

### Reconnection Configuration

Customize reconnection behavior:

```typescript
const client = new P2PQuakeWebSocketClient({
  autoReconnect: true,
  reconnect: {
    initialDelay: 1000, // Start with 1 second
    maxDelay: 30000, // Cap at 30 seconds
    multiplier: 2, // Double delay each attempt
    maxAttempts: 10, // Give up after 10 attempts (Infinity for unlimited)
  },
});

client.on('reconnecting', (attempt, delay) => {
  console.log(`Reconnection attempt ${attempt} in ${delay}ms`);
});
```

### All Event Types

Listen to all events using the generic `data` event:

```typescript
client.on('data', (event) => {
  switch (event.code) {
    case 551:
      console.log('JMA Earthquake:', event.earthquake);
      break;
    case 552:
      console.log('JMA Tsunami:', event.areas);
      break;
    case 554:
      console.log('EEW Detection:', event.type);
      break;
    case 555:
      console.log('Area Peers:', event.areas);
      break;
    case 556:
      console.log('EEW:', event.earthquake);
      break;
    case 561:
      console.log('User Quake:', event.area);
      break;
    case 9611:
      console.log('User Quake Evaluation:', event.confidence);
      break;
  }
});
```

### Resource Cleanup

```typescript
// Disconnect (allows reconnection)
client.disconnect();

// Complete cleanup (destroys all resources)
client.destroy();
```

## REST API Client

For accessing historical earthquake and tsunami data, use the REST API client:

```typescript
import { P2PQuakeRestClient } from 'p2pquake-client';

const restClient = new P2PQuakeRestClient();

// Get recent earthquakes (list)
const quakes = await restClient.getQuakes({
  limit: 10,
  minMagnitude: 5.0,
});

quakes.forEach((quake) => {
  console.log(`Magnitude ${quake.earthquake.hypocenter.magnitude}`);
  console.log(`Location: ${quake.earthquake.hypocenter.name}`);
});

// Get specific earthquake by ID
const quake = await restClient.getQuakeById('20240101120000');

// Get tsunami information (list)
const tsunamis = await restClient.getTsunamis({
  limit: 5,
  sinceDate: '2024-01-01',
});

// Get specific tsunami by ID
const tsunami = await restClient.getTsunamiById('20240101120000');
```

### REST API Methods

- `getQuakes(options?)` - Get list of earthquakes with optional filtering
- `getQuakeById(id)` - Get specific earthquake by ID
- `getTsunamis(options?)` - Get list of tsunamis with optional filtering
- `getTsunamiById(id)` - Get specific tsunami by ID

### REST API Query Options

**Query Parameters:**

- `limit` (1-100): Maximum results (default: 10)
- `offset` (≥0): Pagination offset (default: 0)
- `order` (1 | -1): Sort order (default: -1 newest first)
- `sinceDate`, `untilDate`: Date range filters (YYYY-MM-DD)
- `minMagnitude`, `maxMagnitude`: Magnitude range (quakes only)
- `minScale`, `maxScale`: Seismic intensity range (quakes only)
- `prefectures`: Prefecture filters (quakes only)
- `quakeType`: Information type filter (quakes only)

**Rate Limiting:**

```typescript
const restClient = new P2PQuakeRestClient({
  enableRateLimiting: true,
  rateLimiting: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
  },
});
```

**Note:** Rate limiting is disabled by default. The P2P Quake API enforces 10 requests per minute per IP.

## Event Types

The client supports all P2P Quake event types with full TypeScript definitions:

| Code | Type                  | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 551  | `JMAQuake`            | Official earthquake information from JMA |
| 552  | `JMATsunami`          | Tsunami warnings and forecasts from JMA  |
| 554  | `EEWDetection`        | Early Earthquake Warning detection       |
| 555  | `Areapeers`           | Peer distribution by area                |
| 556  | `EEW`                 | Early Earthquake Warning details         |
| 561  | `Userquake`           | User-reported earthquake detection       |
| 9611 | `UserquakeEvaluation` | Aggregated user report evaluation        |

For detailed type definitions, see the [API Reference](./docs/API.md).

## Seismic Intensity Scale

Japanese seismic intensity scale values (in English):

| Code | Level | Description               |
| ---- | ----- | ------------------------- |
| 10   | 1     | Seismic Intensity 1       |
| 20   | 2     | Seismic Intensity 2       |
| 30   | 3     | Seismic Intensity 3       |
| 40   | 4     | Seismic Intensity 4       |
| 45   | 5-    | Seismic Intensity 5 Lower |
| 50   | 5+    | Seismic Intensity 5 Upper |
| 55   | 6-    | Seismic Intensity 6 Lower |
| 60   | 6+    | Seismic Intensity 6 Upper |
| 70   | 7     | Seismic Intensity 7       |

## API Reference

### `P2PQuakeWebSocketClient`

#### Constructor

```typescript
new P2PQuakeWebSocketClient(options: WebSocketClientOptions)
```

**Options:**

- `url` (string, optional, default: `ENDPOINTS.PRODUCTION`): WebSocket endpoint URL
- `autoReconnect` (boolean, default: `true`): Enable automatic reconnection
- `reconnect` (object, optional): Reconnection configuration
  - `initialDelay` (number, default: `1000`): Initial delay in ms
  - `maxDelay` (number, default: `30000`): Maximum delay in ms
  - `multiplier` (number, default: `2`): Backoff multiplier
  - `maxAttempts` (number, default: `Infinity`): Max attempts
- `eventCodes` (EventCode[], optional): Filter events by code
- `deduplicationWindow` (number, default: `60000`): Dedup window in ms
- `websocket` (object, optional): WebSocket options
  - `protocols` (string | string[], optional): WebSocket protocols
  - `headers` (object, optional): Additional headers

#### Methods

- `connect(): Promise<void>` - Connect to WebSocket
- `disconnect(): void` - Disconnect from WebSocket
- `destroy(): void` - Clean up all resources
- `get isConnected(): boolean` - Get connection status

#### Events

- `connect: () => void` - Connection established
- `disconnect: (code: number, reason: string) => void` - Connection closed
- `error: (error: Error) => void` - Error occurred
- `reconnecting: (attempt: number, delay: number) => void` - Reconnecting
- `data: (event: P2PQuakeEvent) => void` - Any event received
- `551: (event: JMAQuake) => void` - JMA Earthquake
- `552: (event: JMATsunami) => void` - JMA Tsunami
- `554: (event: EEWDetection) => void` - EEW Detection
- `555: (event: Areapeers) => void` - Area Peers
- `556: (event: EEW) => void` - Early Earthquake Warning
- `561: (event: Userquake) => void` - User Earthquake
- `9611: (event: UserquakeEvaluation) => void` - User Quake Evaluation

### Constants

```typescript
import { ENDPOINTS, EVENT_CODES, SEISMIC_INTENSITY_NAMES } from 'p2pquake-client';

ENDPOINTS.PRODUCTION; // 'wss://api.p2pquake.net/v2/ws'
ENDPOINTS.SANDBOX; // 'wss://api-realtime-sandbox.p2pquake.net/v2/ws'

EVENT_CODES; // [551, 552, 554, 555, 556, 561, 9611]

SEISMIC_INTENSITY_NAMES; // { '10': '1', '45': '5弱', ... }
```

## Publishing to NPM

This package is configured for automated publishing via GitHub Actions:

1. Create a version tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Run tests and build
   - Publish to npm with provenance
   - Create a GitHub Release

**Note**: You need to set the `NPM_TOKEN` secret in your GitHub repository settings.

## Development

```bash
# Install dependencies
bun install

# Run TypeScript type checking and ESLint
bun run lint

# Fix ESLint issues
bun run lint:fix

# Format code with Prettier
bun run format

# Check code formatting
bun run format:check

# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Build the package
bun run build

# Clean build artifacts
bun run clean
```

### Code Quality Tools

This project uses several tools to maintain code quality:

- **Prettier**: Code formatting
- **ESLint**: Linting and static analysis
- **EditorConfig**: Consistent editor settings
- **Husky**: Git hooks
- **Commitlint**: Commit message linting

### Git Hooks

Pre-commit hooks will automatically:

- Check code formatting with Prettier
- Run ESLint

Commit message hooks will validate that your commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

Examples:
  feat: add support for custom headers
  fix: resolve reconnection timeout issue
  docs: update API reference
  chore: update dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Links

- [P2P Quake Official Website](https://www.p2pquake.net/)
- [API Documentation](https://www.p2pquake.net/json_api_v2/)
- [GitHub Repository](https://github.com/minagishl/p2pquake-client)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
