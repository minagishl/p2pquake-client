import { QuakeQueryOptions, TsunamiQueryOptions } from '../types/rest';
import { SeismicIntensity } from '../types/base';
import { QUERY_LIMITS } from '../types/constants';
import { ValidationError } from '../errors';

/**
 * Validate QuakeQueryOptions
 *
 * @param options - Query options to validate
 * @throws {ValidationError} If validation fails
 */
export function validateQuakeQuery(options: QuakeQueryOptions): void {
  validateCommonOptions(options);

  // Validate magnitude range
  if (options.minMagnitude !== undefined) {
    if (options.minMagnitude < 0 || options.minMagnitude > 10) {
      throw new ValidationError('minMagnitude must be between 0 and 10');
    }
  }

  if (options.maxMagnitude !== undefined) {
    if (options.maxMagnitude < 0 || options.maxMagnitude > 10) {
      throw new ValidationError('maxMagnitude must be between 0 and 10');
    }
  }

  // Validate min < max
  if (options.minMagnitude !== undefined && options.maxMagnitude !== undefined) {
    if (options.minMagnitude > options.maxMagnitude) {
      throw new ValidationError('minMagnitude must be less than or equal to maxMagnitude');
    }
  }

  // Validate scale values
  if (options.minScale !== undefined && !isValidSeismicIntensity(options.minScale)) {
    throw new ValidationError(`Invalid minScale value: ${options.minScale}`);
  }

  if (options.maxScale !== undefined && !isValidSeismicIntensity(options.maxScale)) {
    throw new ValidationError(`Invalid maxScale value: ${options.maxScale}`);
  }

  // Validate min scale < max scale
  if (options.minScale !== undefined && options.maxScale !== undefined) {
    if (options.minScale > options.maxScale) {
      throw new ValidationError('minScale must be less than or equal to maxScale');
    }
  }

  // Validate prefectures array
  if (options.prefectures !== undefined) {
    if (!Array.isArray(options.prefectures)) {
      throw new ValidationError('prefectures must be an array');
    }
    if (options.prefectures.length === 0) {
      throw new ValidationError('prefectures array cannot be empty');
    }
  }
}

/**
 * Validate TsunamiQueryOptions
 *
 * @param options - Query options to validate
 * @throws {ValidationError} If validation fails
 */
export function validateTsunamiQuery(options: TsunamiQueryOptions): void {
  validateCommonOptions(options);
}

/**
 * Validate common query options
 *
 * @param options - Common query options
 * @throws {ValidationError} If validation fails
 */
function validateCommonOptions(options: {
  limit?: number;
  offset?: number;
  order?: 1 | -1;
  sinceDate?: string;
  untilDate?: string;
}): void {
  // Validate limit
  if (options.limit !== undefined) {
    if (
      !Number.isInteger(options.limit) ||
      options.limit < QUERY_LIMITS.MIN_LIMIT ||
      options.limit > QUERY_LIMITS.MAX_LIMIT
    ) {
      throw new ValidationError(
        `limit must be an integer between ${QUERY_LIMITS.MIN_LIMIT} and ${QUERY_LIMITS.MAX_LIMIT}`
      );
    }
  }

  // Validate offset
  if (options.offset !== undefined) {
    if (!Number.isInteger(options.offset) || options.offset < QUERY_LIMITS.MIN_OFFSET) {
      throw new ValidationError(`offset must be a non-negative integer`);
    }
  }

  // Validate order
  if (options.order !== undefined && options.order !== 1 && options.order !== -1) {
    throw new ValidationError('order must be 1 or -1');
  }

  // Validate date formats
  if (options.sinceDate !== undefined && !isValidDateString(options.sinceDate)) {
    throw new ValidationError('sinceDate must be in ISO 8601 or YYYY-MM-DD format');
  }

  if (options.untilDate !== undefined && !isValidDateString(options.untilDate)) {
    throw new ValidationError('untilDate must be in ISO 8601 or YYYY-MM-DD format');
  }

  // Validate date range
  if (options.sinceDate !== undefined && options.untilDate !== undefined) {
    const sinceTime = new Date(options.sinceDate).getTime();
    const untilTime = new Date(options.untilDate).getTime();
    if (sinceTime > untilTime) {
      throw new ValidationError('sinceDate must be before or equal to untilDate');
    }
  }
}

/**
 * Helper to validate seismic intensity values
 *
 * @param value - Value to check
 * @returns True if value is a valid SeismicIntensity
 */
function isValidSeismicIntensity(value: number): value is SeismicIntensity {
  return [-1, 0, 10, 20, 30, 40, 45, 50, 55, 60, 70, 99].includes(value);
}

/**
 * Helper to validate date strings
 *
 * @param dateString - Date string to validate
 * @returns True if date string is valid
 */
function isValidDateString(dateString: string): boolean {
  // ISO 8601 or YYYY-MM-DD format
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }

  // Validate date is not NaN
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
