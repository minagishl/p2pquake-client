import { RateLimitConfig } from './rest';

/**
 * WebSocket endpoint URLs
 */
export const WS_ENDPOINTS = {
  /** Production WebSocket endpoint */
  PRODUCTION: 'wss://api.p2pquake.net/v2/ws',
  /** Sandbox WebSocket endpoint for testing */
  SANDBOX: 'wss://api-realtime-sandbox.p2pquake.net/v2/ws',
} as const;

/**
 * REST API configuration
 */
export const REST_ENDPOINTS = {
  /** Production environment configuration */
  PRODUCTION: {
    /** Production REST API base URL */
    BASE_URL: 'https://api.p2pquake.net/v2',
  },
  /** Sandbox environment configuration */
  SANDBOX: {
    /** Sandbox REST API base URL */
    BASE_URL: 'https://api-sandbox.p2pquake.net/v2',
  },
  /** API path segments (shared across environments) */
  PATHS: {
    /** JMA Quake list endpoint */
    JMA_QUAKE: '/jma/quake',
    /** JMA Tsunami list endpoint */
    JMA_TSUNAMI: '/jma/tsunami',
    /** JMA Quake by ID endpoint (function) */
    JMA_QUAKE_BY_ID: (id: string) => `/jma/quake/${id}`,
    /** JMA Tsunami by ID endpoint (function) */
    JMA_TSUNAMI_BY_ID: (id: string) => `/jma/tsunami/${id}`,
  },
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

/**
 * Environment type for API endpoints
 */
export type Environment = 'PRODUCTION' | 'SANDBOX';

/**
 * REST API path type
 */
export type RestPath = keyof typeof REST_ENDPOINTS.PATHS;

/**
 * Helper function to build REST API URLs
 *
 * @param environment - Environment name (PRODUCTION or SANDBOX)
 * @param path - API path segment (optional)
 * @param id - ID for dynamic paths (optional, required for *_BY_ID paths)
 * @returns Complete REST API URL
 *
 * @example
 * ```typescript
 * // Get production base URL
 * buildRestUrl('PRODUCTION') // 'https://api.p2pquake.net/v2'
 *
 * // Get full URL for quake list
 * buildRestUrl('PRODUCTION', 'JMA_QUAKE') // 'https://api.p2pquake.net/v2/jma/quake'
 *
 * // Get full URL for specific quake
 * buildRestUrl('PRODUCTION', 'JMA_QUAKE_BY_ID', '20240101120000')
 * // 'https://api.p2pquake.net/v2/jma/quake/20240101120000'
 * ```
 */
export function buildRestUrl(environment: Environment, path?: RestPath, id?: string): string {
  const baseUrl = REST_ENDPOINTS[environment].BASE_URL;

  if (!path) {
    return baseUrl;
  }

  const pathValue = REST_ENDPOINTS.PATHS[path];
  if (typeof pathValue === 'function') {
    if (!id) {
      throw new Error(`ID is required for path: ${String(path)}`);
    }
    return baseUrl + pathValue(id);
  }

  return baseUrl + pathValue;
}

/**
 * Get REST API base URL for an environment
 *
 * @param environment - Environment name (PRODUCTION or SANDBOX)
 * @returns Base URL for the environment
 *
 * @example
 * ```typescript
 * getRestBaseUrl('PRODUCTION') // 'https://api.p2pquake.net/v2'
 * getRestBaseUrl('SANDBOX')    // 'https://api-sandbox.p2pquake.net/v2'
 * ```
 */
export function getRestBaseUrl(environment: Environment): string {
  return REST_ENDPOINTS[environment].BASE_URL;
}
