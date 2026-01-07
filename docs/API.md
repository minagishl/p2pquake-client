# API Reference

Complete API reference for the P2P Quake WebSocket client.

## Table of Contents

- [P2PQuakeWebSocketClient](#p2pquakewebsocketclient)
- [Types](#types)
- [Constants](#constants)
- [Errors](#errors)
- [Utilities](#utilities)

## P2PQuakeWebSocketClient

The main client class for connecting to P2P Quake WebSocket API.

### Constructor

```typescript
new P2PQuakeWebSocketClient(options: WebSocketClientOptions)
```

Creates a new P2P Quake client instance.

**Parameters:**

- `options` (WebSocketClientOptions): Configuration options

**WebSocketClientOptions:**

```typescript
interface WebSocketClientOptions {
  url?: string;
  autoReconnect?: boolean;
  reconnect?: Partial<ReconnectConfig>;
  eventCodes?: EventCode[];
  deduplicationWindow?: number;
  websocket?: {
    protocols?: string | string[];
    headers?: Record<string, string>;
  };
}
```

- `url`: WebSocket endpoint URL (optional, default: `WS_ENDPOINTS.PRODUCTION`)
- `autoReconnect`: Enable automatic reconnection (default: `true`)
- `reconnect`: Reconnection configuration
  - `initialDelay`: Initial delay in milliseconds (default: `1000`)
  - `maxDelay`: Maximum delay in milliseconds (default: `30000`)
  - `multiplier`: Backoff multiplier (default: `2`)
  - `maxAttempts`: Maximum reconnection attempts (default: `Infinity`)
- `eventCodes`: Array of event codes to listen for (default: all codes)
- `deduplicationWindow`: Time window for deduplication in milliseconds (default: `60000`)
- `websocket`: WebSocket-specific options
  - `protocols`: WebSocket protocols
  - `headers`: Additional HTTP headers

### Methods

#### connect()

```typescript
connect(): Promise<void>
```

Connect to the WebSocket endpoint.

**Returns:** Promise that resolves when connection is established

**Throws:**

- `ConnectionError` if connection fails
- `ConnectionError` if already connecting

**Example:**

```typescript
try {
  await client.connect();
  console.log('Connected');
} catch (error) {
  console.error('Connection failed:', error);
}
```

#### disconnect()

```typescript
disconnect(): void
```

Disconnect from the WebSocket. This will not trigger automatic reconnection.

**Example:**

```typescript
client.disconnect();
```

#### destroy()

```typescript
destroy(): void
```

Clean up all resources including connection, event listeners, timers, and deduplicator.

**Example:**

```typescript
client.destroy();
```

### Properties

#### isConnected

```typescript
get isConnected(): boolean
```

Returns `true` if the client is currently connected to the WebSocket.

**Example:**

```typescript
if (client.isConnected) {
  console.log('Client is connected');
}
```

### Events

The client emits various events that you can listen to using the `on()` method.

#### connect

```typescript
client.on('connect', () => void)
```

Emitted when the WebSocket connection is successfully established.

**Example:**

```typescript
client.on('connect', () => {
  console.log('Connected to P2P Quake');
});
```

#### disconnect

```typescript
client.on('disconnect', (code: number, reason: string) => void)
```

Emitted when the WebSocket connection is closed.

**Parameters:**

- `code`: Close code
- `reason`: Close reason

**Example:**

```typescript
client.on('disconnect', (code, reason) => {
  console.log(`Disconnected: ${code} - ${reason}`);
});
```

#### error

```typescript
client.on('error', (error: Error) => void)
```

Emitted when an error occurs.

**Parameters:**

- `error`: Error object (ConnectionError, ValidationError, or ReconnectError)

**Example:**

```typescript
client.on('error', (error) => {
  console.error('Error:', error.message);
});
```

#### reconnecting

```typescript
client.on('reconnecting', (attempt: number, delay: number) => void)
```

Emitted when the client is attempting to reconnect.

**Parameters:**

- `attempt`: Current attempt number
- `delay`: Delay until next attempt in milliseconds

**Example:**

```typescript
client.on('reconnecting', (attempt, delay) => {
  console.log(`Reconnecting (attempt ${attempt}) in ${delay}ms`);
});
```

#### data

```typescript
client.on('data', (event: P2PQuakeEvent) => void)
```

Emitted for all received events.

**Parameters:**

- `event`: Event data (discriminated union of all event types)

**Example:**

```typescript
client.on('data', (event) => {
  console.log(`Received event ${event.code}:`, event);
});
```

#### Event Type-Specific Events

You can also listen to specific event types using their code:

```typescript
client.on(551, (event: JMAQuake) => void)
client.on(552, (event: JMATsunami) => void)
client.on(554, (event: EEWDetection) => void)
client.on(555, (event: Areapeers) => void)
client.on(556, (event: EEW) => void)
client.on(561, (event: Userquake) => void)
client.on(9611, (event: UserquakeEvaluation) => void)
```

These events are fully type-safe - the event parameter is typed according to the code.

**Example:**

```typescript
client.on(551, (earthquake) => {
  // earthquake is typed as JMAQuake
  console.log(`Magnitude: ${earthquake.earthquake.hypocenter.magnitude}`);
});
```

## Types

### Event Types

#### BasicData

Base interface inherited by all event types.

```typescript
interface BasicData {
  id: string;
  code: number;
  time: string;
}
```

#### JMAQuake (Code 551)

Official earthquake information from the Japan Meteorological Agency.

```typescript
interface JMAQuake extends BasicData {
  code: 551;
  issue: {
    time: string;
    type:
      | 'ScalePrompt'
      | 'Destination'
      | 'ScaleAndDestination'
      | 'DetailScale'
      | 'Foreign'
      | 'Other';
    source: string;
    correct: string;
  };
  earthquake: {
    time: string;
    hypocenter: Hypocenter;
    maxScale: SeismicIntensity;
    domesticTsunami: 'None' | 'Unknown' | 'Checking' | 'NonEffective' | 'Watch' | 'Warning';
    foreignTsunami:
      | 'None'
      | 'Unknown'
      | 'Checking'
      | 'NonEffectiveNearby'
      | 'WarningNearby'
      | 'WarningPacific'
      | 'WarningPacificWide'
      | 'WarningIndian'
      | 'WarningIndianWide'
      | 'Potential';
  };
  points: Array<{
    pref: string;
    addr: string;
    isArea: boolean;
    scale: SeismicIntensity;
  }>;
  comments?: {
    freeFormComment?: string;
  };
}
```

#### JMATsunami (Code 552)

Tsunami warning, advisory, or watch information.

```typescript
interface JMATsunami extends BasicData {
  code: 552;
  cancelled: boolean;
  issue: {
    source: string;
    time: string;
    type: 'Focus';
  };
  areas: Array<{
    grade: 'MajorWarning' | 'Warning' | 'Watch' | 'Unknown';
    immediate: boolean;
    name: string;
    firstHeight?: {
      arrivalTime: string;
      condition: string;
    };
    maxHeight?: {
      description: string;
      value: number;
    };
  }>;
}
```

#### EEWDetection (Code 554)

Early Earthquake Warning detection notification.

```typescript
interface EEWDetection extends BasicData {
  code: 554;
  type: 'Full' | 'Chime';
}
```

#### Areapeers (Code 555)

Distribution of P2P Quake peers by region.

```typescript
interface Areapeers extends BasicData {
  code: 555;
  areas: Array<{
    id: number;
    peer: number;
  }>;
}
```

#### EEW (Code 556)

Early Earthquake Warning details.

```typescript
interface EEW extends BasicData {
  code: 556;
  test: boolean;
  earthquake: {
    originTime: string;
    arrivalTime: string;
    condition?: string;
    hypocenter: Hypocenter;
  };
  issue: {
    time: string;
    eventId: string;
    serial: string;
  };
  cancelled: boolean;
  areas: Array<{
    pref: string;
    name: string;
    scaleFrom: SeismicIntensity;
    scaleTo: SeismicIntensity;
    kindCode: '10' | '11' | '19';
    arrivalTime?: string;
  }>;
}
```

#### Userquake (Code 561)

User-reported earthquake detection.

```typescript
interface Userquake extends BasicData {
  code: 561;
  area: number;
}
```

#### UserquakeEvaluation (Code 9611)

Aggregated evaluation of user-reported earthquakes.

```typescript
interface UserquakeEvaluation extends BasicData {
  code: 9611;
  count: number;
  confidence: number;
  started_at: string;
  updated_at: string;
  area_confidences: Record<
    string,
    {
      confidence: number;
      count: number;
      display: string;
    }
  >;
}
```

### Supporting Types

#### Hypocenter

```typescript
interface Hypocenter extends Coordinates {
  name: string;
  reduceName?: string;
  depth: number;
  magnitude: number;
}
```

#### Coordinates

```typescript
interface Coordinates {
  latitude: number; // -200 indicates missing data
  longitude: number; // -200 indicates missing data
}
```

#### SeismicIntensity

```typescript
type SeismicIntensity = -1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | 99;
```

Values:

- `-1`: Unknown
- `10`: 震度1 (Intensity 1)
- `20`: 震度2 (Intensity 2)
- `30`: 震度3 (Intensity 3)
- `40`: 震度4 (Intensity 4)
- `45`: 震度5弱 (Intensity 5 Lower)
- `50`: 震度5強 (Intensity 5 Upper)
- `55`: 震度6弱 (Intensity 6 Lower)
- `60`: 震度6強 (Intensity 6 Upper)
- `70`: 震度7 (Intensity 7)
- `99`: Abnormal

## Constants

### WS_ENDPOINTS

WebSocket endpoint URLs.

```typescript
const WS_ENDPOINTS: {
  PRODUCTION: 'wss://api.p2pquake.net/v2/ws';
  SANDBOX: 'wss://api-realtime-sandbox.p2pquake.net/v2/ws';
};
```

### REST_ENDPOINTS

REST API configuration.

```typescript
const REST_ENDPOINTS: {
  PRODUCTION: {
    BASE_URL: 'https://api.p2pquake.net/v2';
  };
  SANDBOX: {
    BASE_URL: 'https://api-sandbox.p2pquake.net/v2';
  };
  PATHS: {
    JMA_QUAKE: '/jma/quake';
    JMA_TSUNAMI: '/jma/tsunami';
    JMA_QUAKE_BY_ID: (id: string) => string;
    JMA_TSUNAMI_BY_ID: (id: string) => string;
  };
};
```

### EVENT_CODES

```typescript
const EVENT_CODES: readonly [551, 552, 554, 555, 556, 561, 9611];
```

### DEFAULT_RECONNECT_CONFIG

```typescript
const DEFAULT_RECONNECT_CONFIG: {
  initialDelay: 1000;
  maxDelay: 30000;
  multiplier: 2;
  maxAttempts: Infinity;
};
```

### SEISMIC_INTENSITY_NAMES

```typescript
const SEISMIC_INTENSITY_NAMES: Record<number, string>;
```

Mapping of seismic intensity codes to Japanese display names.

## Errors

### P2PQuakeError

Base error class for all client errors.

```typescript
class P2PQuakeError extends Error {
  name: 'P2PQuakeError';
}
```

### ConnectionError

Error thrown when WebSocket connection fails or is lost.

```typescript
class ConnectionError extends P2PQuakeError {
  name: 'ConnectionError';
  code?: number;
}
```

### ValidationError

Error thrown when received event data is invalid.

```typescript
class ValidationError extends P2PQuakeError {
  name: 'ValidationError';
  data?: unknown;
}
```

### ReconnectError

Error thrown when reconnection attempts are exhausted.

```typescript
class ReconnectError extends P2PQuakeError {
  name: 'ReconnectError';
  attempts: number;
}
```

## Utilities

### buildRestUrl

Build complete REST API URLs.

```typescript
function buildRestUrl(environment: 'PRODUCTION' | 'SANDBOX', path?: RestPath, id?: string): string;
```

**Parameters:**

- `environment`: Environment name (PRODUCTION or SANDBOX)
- `path`: API path segment (optional)
- `id`: ID for dynamic paths (optional, required for \*\_BY_ID paths)

**Returns:** Complete REST API URL

**Examples:**

```typescript
// Get base URL
buildRestUrl('PRODUCTION');
// → 'https://api.p2pquake.net/v2'

// Build URL with static path
buildRestUrl('PRODUCTION', 'JMA_QUAKE');
// → 'https://api.p2pquake.net/v2/jma/quake'

// Build URL with dynamic path
buildRestUrl('PRODUCTION', 'JMA_QUAKE_BY_ID', '20240101120000');
// → 'https://api.p2pquake.net/v2/jma/quake/20240101120000'
```

### getRestBaseUrl

Get REST API base URL for an environment.

```typescript
function getRestBaseUrl(environment: 'PRODUCTION' | 'SANDBOX'): string;
```

**Parameters:**

- `environment`: Environment name (PRODUCTION or SANDBOX)

**Returns:** Base URL for the environment

**Examples:**

```typescript
getRestBaseUrl('PRODUCTION'); // → 'https://api.p2pquake.net/v2'
getRestBaseUrl('SANDBOX'); // → 'https://api-sandbox.p2pquake.net/v2'
```

### Validators

Type guard functions for runtime validation.

#### isBasicData

```typescript
function isBasicData(data: unknown): data is BasicData;
```

Checks if data has BasicData structure (id, code, time).

#### isValidEventCode

```typescript
function isValidEventCode(code: unknown): code is EventCode;
```

Checks if code is a valid event code (551, 552, 554, 555, 556, 561, or 9611).

#### isP2PQuakeEvent

```typescript
function isP2PQuakeEvent(data: unknown): data is P2PQuakeEvent;
```

Validates that data is a valid P2P Quake event.

#### validateEvent

```typescript
function validateEvent<T extends EventCode>(data: unknown, code: T): data is EventTypeMap[T];
```

Validates that data matches a specific event type.
