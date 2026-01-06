import { RateLimitConfig } from './rest';

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
 * P2P Quake REST API endpoints
 */
export const REST_ENDPOINTS = {
  /** Production REST API base URL */
  BASE_URL: 'https://api.p2pquake.net/v2',
  /** Sandbox REST API base URL */
  SANDBOX_BASE_URL: 'https://api-sandbox.p2pquake.net/v2',
  /** JMA Quake list endpoint */
  JMA_QUAKE: '/jma/quake',
  /** JMA Tsunami list endpoint */
  JMA_TSUNAMI: '/jma/tsunami',
  /** JMA Quake by ID endpoint (function) */
  JMA_QUAKE_BY_ID: (id: string) => `/jma/quake/${id}`,
  /** JMA Tsunami by ID endpoint (function) */
  JMA_TSUNAMI_BY_ID: (id: string) => `/jma/tsunami/${id}`,
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

/**
 * Default rate limiting configuration
 * Matches P2P Quake API limits: 10 requests per minute
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60000,
} as const;

/**
 * Query parameter limits for REST API
 */
export const QUERY_LIMITS = {
  /** Minimum limit value */
  MIN_LIMIT: 1,
  /** Maximum limit value */
  MAX_LIMIT: 100,
  /** Default limit if not specified */
  DEFAULT_LIMIT: 10,
  /** Minimum offset value */
  MIN_OFFSET: 0,
} as const;
