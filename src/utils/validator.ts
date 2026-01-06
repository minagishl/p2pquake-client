import { P2PQuakeEvent, EventCode, EventTypeMap } from '../types/events';
import { BasicData } from '../types/base';
import { EVENT_CODES } from '../types/constants';

/**
 * Type guard to check if data has BasicData structure
 *
 * @param data - Data to validate
 * @returns true if data has id, code, and time fields
 */
export function isBasicData(data: unknown): data is BasicData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return typeof obj.id === 'string' && typeof obj.code === 'number' && typeof obj.time === 'string';
}

/**
 * Type guard to check if code is a valid event code
 *
 * @param code - Code to validate
 * @returns true if code is a valid EventCode
 */
export function isValidEventCode(code: unknown): code is EventCode {
  return typeof code === 'number' && EVENT_CODES.includes(code as EventCode);
}

/**
 * Type guard for P2PQuakeEvent
 *
 * Validates that data has BasicData structure and a valid event code
 *
 * @param data - Data to validate
 * @returns true if data is a valid P2PQuakeEvent
 */
export function isP2PQuakeEvent(data: unknown): data is P2PQuakeEvent {
  return isBasicData(data) && isValidEventCode(data.code);
}

/**
 * Validate specific event type structure
 *
 * Note: This performs basic validation only. Full schema validation
 * would require additional runtime validation libraries.
 *
 * @param data - Data to validate
 * @param code - Expected event code
 * @returns true if data matches the expected event type
 */
export function validateEvent<T extends EventCode>(
  data: unknown,
  code: T
): data is EventTypeMap[T] {
  if (!isP2PQuakeEvent(data)) {
    return false;
  }

  return data.code === code;
}
