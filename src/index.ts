/**
 * P2P Quake WebSocket Client
 *
 * Type-safe WebSocket client for P2P Quake earthquake information API
 *
 * @packageDocumentation
 */

// Export main client
export { P2PQuakeClient, ClientOptions } from './client';

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

export {
  ENDPOINTS,
  EVENT_CODES,
  DEFAULT_RECONNECT_CONFIG,
  SEISMIC_INTENSITY_NAMES,
} from './types/constants';

// Export errors
export { P2PQuakeError, ConnectionError, ValidationError, ReconnectError } from './errors';

// Export utility types
export { ReconnectConfig } from './utils/reconnect';

// Export validators (useful for advanced use cases)
export { isBasicData, isValidEventCode, isP2PQuakeEvent, validateEvent } from './utils/validator';
