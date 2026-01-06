import { QuakeQueryOptions, TsunamiQueryOptions } from '../types/rest';

/**
 * Build URL with query parameters
 *
 * @param baseUrl - Base URL without query string
 * @param params - Query parameters object
 * @returns Complete URL with query string
 */
export function buildQueryUrl(baseUrl: string, params: Record<string, unknown>): string {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue; // Skip undefined/null values
    }

    if (Array.isArray(value)) {
      // Handle array parameters (e.g., prefectures[]=Tokyo&prefectures[]=Osaka)
      for (const item of value) {
        queryParams.append(`${key}[]`, String(item));
      }
    } else {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Convert query options to API parameters
 *
 * Transforms TypeScript-friendly option names to API parameter names
 *
 * @param options - Query options
 * @returns API parameter object
 */
export function toApiParams(
  options: QuakeQueryOptions | TsunamiQueryOptions
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    limit: options.limit,
    offset: options.offset,
    order: options.order,
    since_date: options.sinceDate,
    until_date: options.untilDate,
  };

  // Add QuakeQueryOptions specific params
  if ('quakeType' in options) {
    params.quake_type = options.quakeType;
    params.min_magnitude = options.minMagnitude;
    params.max_magnitude = options.maxMagnitude;
    params.min_scale = options.minScale;
    params.max_scale = options.maxScale;
    params.prefectures = options.prefectures;
  }

  return params;
}
