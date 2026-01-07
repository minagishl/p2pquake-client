/**
 * P2P Quake Client
 *
 * Type-safe WebSocket and REST API clients for P2P Quake earthquake information API
 *
 * @packageDocumentation
 */

// Export WebSocket client
export { P2PQuakeWebSocketClient, WebSocketClientOptions } from './clients/ws';

// Export REST API client
export { P2PQuakeRestClient, RestClientOptions } from './clients/rest';

// Export types
export { BasicData, SeismicIntensity, Coordinates, Hypocenter } from './types/base';

export {
  JMAQuake,
  JMATsunami,
  EEWDetection,
  Areapeers,
  EEW,
  Userquake,
  UserquakeEvaluation,
  P2PQuakeEvent,
  EventTypeMap,
  EventCode,
} from './types/events';

// Export REST API types
export { QuakeQueryOptions, TsunamiQueryOptions, RateLimitConfig } from './types/rest';

export {
  WS_ENDPOINTS,
  REST_ENDPOINTS,
  EVENT_CODES,
  DEFAULT_RECONNECT_CONFIG,
  DEFAULT_RATE_LIMIT_CONFIG,
  QUERY_LIMITS,
  SEISMIC_INTENSITY_NAMES,
  buildRestUrl,
  getRestBaseUrl,
  type Environment,
  type RestPath,
} from './types/constants';

// Export errors
export {
  P2PQuakeError,
  ConnectionError,
  ValidationError,
  ReconnectError,
  RateLimitError,
  NotFoundError,
} from './errors';

// Export utility types
export { ReconnectConfig } from './utils/reconnect';

// Export validators (useful for advanced use cases)
export { isBasicData, isValidEventCode, isP2PQuakeEvent, validateEvent } from './utils/validator';
