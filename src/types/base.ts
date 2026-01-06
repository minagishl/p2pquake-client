/**
 * Base interface inherited by all event types
 */
export interface BasicData {
  /** Unique event identifier for deduplication */
  id: string;
  /** Event type code (551, 552, 554, 555, 556, 561, 9611) */
  code: number;
  /** Receipt timestamp in format "2006/01/02 15:04:05.999" */
  time: string;
}

/**
 * Seismic intensity scale values
 * - 10: 震度1
 * - 20: 震度2
 * - 30: 震度3
 * - 40: 震度4
 * - 45: 震度5弱
 * - 50: 震度5強
 * - 55: 震度6弱
 * - 60: 震度6強
 * - 70: 震度7
 * - -1: Unknown
 * - 99: Abnormal
 */
export type SeismicIntensity = -1 | 0 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70 | 99;

/**
 * Geographic coordinates with special sentinel values
 */
export interface Coordinates {
  /** Latitude in degrees, -200 indicates missing data */
  latitude: number;
  /** Longitude in degrees, -200 indicates missing data */
  longitude: number;
}

/**
 * Hypocenter information
 */
export interface Hypocenter extends Coordinates {
  /** Location name in Japanese */
  name: string;
  /** Reduced/simplified name (EEW only) */
  reduceName?: string;
  /** Depth in km, -1 indicates missing data */
  depth: number;
  /** Magnitude value */
  magnitude: number;
}
