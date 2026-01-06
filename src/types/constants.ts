/**
 * Official P2P Quake WebSocket endpoints
 */
export const ENDPOINTS = {
  /** Production WebSocket endpoint */
  PRODUCTION: 'wss://api.p2pquake.net/v2/ws',
  /** Sandbox WebSocket endpoint for testing */
  SANDBOX: 'wss://api-realtime-sandbox.p2pquake.net/v2/ws',
} as const;

/**
 * All supported event codes
 */
export const EVENT_CODES = [551, 552, 554, 555, 556, 561, 9611] as const;

/**
 * Default reconnection configuration
 */
export const DEFAULT_RECONNECT_CONFIG = {
  /** Initial delay in milliseconds */
  initialDelay: 1000,
  /** Maximum delay in milliseconds */
  maxDelay: 30000,
  /** Backoff multiplier */
  multiplier: 2,
  /** Maximum reconnection attempts (Infinity = unlimited) */
  maxAttempts: Infinity,
} as const;

/**
 * Seismic intensity display names (Japanese)
 */
export const SEISMIC_INTENSITY_NAMES: Record<number, string> = {
  '-1': '不明',
  '0': '0',
  '10': '1',
  '20': '2',
  '30': '3',
  '40': '4',
  '45': '5弱',
  '50': '5強',
  '55': '6弱',
  '60': '6強',
  '70': '7',
  '99': '異常',
} as const;
