import { BasicData, SeismicIntensity, Hypocenter } from './base';

/**
 * Code 551: JMA Earthquake Information
 *
 * Official earthquake information published by the Japan Meteorological Agency
 */
export interface JMAQuake extends BasicData {
  code: 551;
  /** Issue information */
  issue: {
    /** Issue time */
    time: string;
    /** Information type */
    type:
      | 'ScalePrompt'
      | 'Destination'
      | 'ScaleAndDestination'
      | 'DetailScale'
      | 'Foreign'
      | 'Other';
    /** Information source */
    source: string;
    /** Correction information */
    correct: string;
  };
  /** Earthquake details */
  earthquake: {
    /** Occurrence time */
    time: string;
    /** Hypocenter information */
    hypocenter: Hypocenter;
    /** Maximum seismic intensity */
    maxScale: SeismicIntensity;
    /** Domestic tsunami status */
    domesticTsunami: 'None' | 'Unknown' | 'Checking' | 'NonEffective' | 'Watch' | 'Warning';
    /** Foreign tsunami status */
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
  /** Seismic observation points */
  points: Array<{
    /** Prefecture name */
    pref: string;
    /** Address/location name */
    addr: string;
    /** Is this an area (not a specific point) */
    isArea: boolean;
    /** Observed seismic intensity */
    scale: SeismicIntensity;
  }>;
  /** Additional comments */
  comments?: {
    /** Free-form comment text */
    freeFormComment?: string;
  };
}

/**
 * Code 552: JMA Tsunami Forecast
 *
 * Tsunami warning, advisory, or watch information from JMA
 */
export interface JMATsunami extends BasicData {
  code: 552;
  /** Whether the forecast has been cancelled */
  cancelled: boolean;
  /** Issue information */
  issue: {
    /** Information source */
    source: string;
    /** Issue time */
    time: string;
    /** Information type */
    type: 'Focus';
  };
  /** Forecast areas */
  areas: Array<{
    /** Warning grade */
    grade: 'MajorWarning' | 'Warning' | 'Watch' | 'Unknown';
    /** Whether tsunami arrival is immediate */
    immediate: boolean;
    /** Forecast region name */
    name: string;
    /** First wave arrival information */
    firstHeight?: {
      /** Arrival time */
      arrivalTime: string;
      /** Arrival condition */
      condition: string;
    };
    /** Maximum height information */
    maxHeight?: {
      /** Description of maximum height */
      description: string;
      /** Height value in meters */
      value: number;
    };
  }>;
}

/**
 * Code 554: EEW Detection
 *
 * Detection of Emergency Earthquake Warning broadcast
 */
export interface EEWDetection extends BasicData {
  code: 554;
  /** Detection type: Full (chime + audio) or Chime only */
  type: 'Full' | 'Chime';
}

/**
 * Code 555: Peer Distribution by Area
 *
 * Number of P2P Quake peers connected in each area
 */
export interface Areapeers extends BasicData {
  code: 555;
  /** Area peer counts */
  areas: Array<{
    /** Region code */
    id: number;
    /** Number of peers in this area */
    peer: number;
  }>;
}

/**
 * Code 556: Early Earthquake Warning (EEW)
 *
 * WARNING: Content and delivery quality are not guaranteed.
 * This is preliminary information and may contain errors.
 */
export interface EEW extends BasicData {
  code: 556;
  /** Whether this is a test message */
  test: boolean;
  /** Earthquake details */
  earthquake: {
    /** Estimated origin time */
    originTime: string;
    /** Estimated arrival time */
    arrivalTime: string;
    /** Additional condition information */
    condition?: string;
    /** Hypocenter information */
    hypocenter: Hypocenter;
  };
  /** Issue information */
  issue: {
    /** Issue time */
    time: string;
    /** Event identifier */
    eventId: string;
    /** Serial number */
    serial: string;
  };
  /** Whether the warning has been cancelled */
  cancelled: boolean;
  /** Forecast areas */
  areas: Array<{
    /** Prefecture name */
    pref: string;
    /** Area name */
    name: string;
    /** Minimum forecasted seismic intensity */
    scaleFrom: SeismicIntensity;
    /** Maximum forecasted seismic intensity */
    scaleTo: SeismicIntensity;
    /** Kind code */
    kindCode: '10' | '11' | '19';
    /** Estimated arrival time */
    arrivalTime?: string;
  }>;
}

/**
 * Code 561: User-reported Earthquake Detection
 *
 * Individual user report of felt earthquake
 */
export interface Userquake extends BasicData {
  code: 561;
  /** Region code where earthquake was felt */
  area: number;
}

/**
 * Code 9611: Userquake Evaluation Results
 *
 * Aggregated evaluation of user-reported earthquake detections
 */
export interface UserquakeEvaluation extends BasicData {
  code: 9611;
  /** Total number of user reports */
  count: number;
  /** Overall confidence level (0-1) */
  confidence: number;
  /** Evaluation start time */
  started_at: string;
  /** Last update time */
  updated_at: string;
  /** Confidence levels per area */
  area_confidences: Record<
    string,
    {
      /** Confidence level for this area */
      confidence: number;
      /** Number of reports from this area */
      count: number;
      /** Display string for this area */
      display: string;
    }
  >;
}

/**
 * Discriminated union of all event types
 *
 * Use the `code` field to narrow the type:
 * @example
 * ```typescript
 * if (event.code === 551) {
 *   // event is now typed as JMAQuake
 *   console.log(event.earthquake.hypocenter.magnitude);
 * }
 * ```
 */
export type P2PQuakeEvent =
  | JMAQuake
  | JMATsunami
  | EEWDetection
  | Areapeers
  | EEW
  | Userquake
  | UserquakeEvaluation;

/**
 * Event type map for type-safe filtering
 *
 * Maps event codes to their corresponding types for type-safe event handlers
 */
export interface EventTypeMap {
  551: JMAQuake;
  552: JMATsunami;
  554: EEWDetection;
  555: Areapeers;
  556: EEW;
  561: Userquake;
  9611: UserquakeEvaluation;
}

/**
 * Valid event codes
 */
export type EventCode = keyof EventTypeMap;
