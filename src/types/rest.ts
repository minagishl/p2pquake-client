import { SeismicIntensity } from './base';

/**
 * REST API client configuration options
 */
export interface RestClientOptions {
  /** Base URL for REST API (default: 'https://api.p2pquake.net/v2') */
  baseUrl?: string;

  /** Enable rate limiting (default: false) */
  enableRateLimiting?: boolean;

  /** Rate limiting configuration */
  rateLimiting?: RateLimitConfig;

  /** Custom HTTP headers */
  headers?: Record<string, string>;

  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests per window */
  maxRequests: number;

  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Common query options for list endpoints
 */
interface CommonQueryOptions {
  /** Maximum number of results (1-100, default: 10) */
  limit?: number;

  /** Offset for pagination (≥0, default: 0) */
  offset?: number;

  /** Sort order: 1 for ascending, -1 for descending (default: -1) */
  order?: 1 | -1;

  /** Filter by events since this date (YYYY-MM-DD or ISO 8601) */
  sinceDate?: string;

  /** Filter by events until this date (YYYY-MM-DD or ISO 8601) */
  untilDate?: string;
}

/**
 * Query options for /jma/quake endpoint
 */
export interface QuakeQueryOptions extends CommonQueryOptions {
  /** Filter by quake information type */
  quakeType?:
    | 'ScalePrompt'
    | 'Destination'
    | 'ScaleAndDestination'
    | 'DetailScale'
    | 'Foreign'
    | 'Other';

  /** Minimum magnitude filter */
  minMagnitude?: number;

  /** Maximum magnitude filter */
  maxMagnitude?: number;

  /** Minimum seismic intensity scale */
  minScale?: SeismicIntensity;

  /** Maximum seismic intensity scale */
  maxScale?: SeismicIntensity;

  /** Filter by prefectures (array of prefecture names) */
  prefectures?: string[];
}

/**
 * Query options for /jma/tsunami endpoint
 *
 * Tsunami endpoint only supports common query options (limit, offset, order, dates).
 * No tsunami-specific filters are available.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TsunamiQueryOptions extends CommonQueryOptions {}
