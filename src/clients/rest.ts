import type { RestClientOptions, QuakeQueryOptions, TsunamiQueryOptions } from '../types/rest';
import { JMAQuake, JMATsunami } from '../types/events';
import { REST_ENDPOINTS, DEFAULT_RATE_LIMIT_CONFIG } from '../types/constants';
import { RateLimiter } from '../utils/rate-limiter';
import { buildQueryUrl, toApiParams } from '../utils/query-builder';
import { validateQuakeQuery, validateTsunamiQuery } from '../utils/query-validator';
import { validateEvent } from '../utils/validator';
import { P2PQuakeError, ValidationError, RateLimitError, NotFoundError } from '../errors';

// Re-export RestClientOptions for convenience
export type { RestClientOptions };

/**
 * P2P Quake REST API Client
 *
 * Provides access to historical earthquake and tsunami data via REST API.
 * This client is separate from the WebSocket client and focuses on historical data retrieval.
 *
 * @example
 * ```typescript
 * const restClient = new P2PQuakeRestClient({
 *   enableRateLimiting: true,
 * });
 *
 * // Get list of earthquakes
 * const quakes = await restClient.getQuakes({
 *   limit: 10,
 *   minMagnitude: 5.0,
 * });
 *
 * // Get specific earthquake by ID
 * const quake = await restClient.getQuakeById('20240101120000');
 * ```
 */
export class P2PQuakeRestClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;
  private rateLimiter?: RateLimiter;

  constructor(options: RestClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? REST_ENDPOINTS.BASE_URL;
    this.timeout = options.timeout ?? 10000;
    this.headers = {
      Accept: 'application/json',
      'User-Agent': 'p2pquake-client/1.0.0',
      ...options.headers,
    };

    if (options.enableRateLimiting) {
      this.rateLimiter = new RateLimiter(options.rateLimiting ?? DEFAULT_RATE_LIMIT_CONFIG);
    }
  }

  /**
   * Get JMA Quake data (list)
   *
   * @param options - Query parameters for filtering
   * @returns Promise resolving to array of JMAQuake events
   * @throws {ValidationError} If query parameters are invalid
   * @throws {P2PQuakeError} If API request fails
   *
   * @example
   * ```typescript
   * const quakes = await restClient.getQuakes({
   *   limit: 10,
   *   minMagnitude: 5.0,
   *   sinceDate: '2024-01-01',
   * });
   * ```
   */
  public async getQuakes(options: QuakeQueryOptions = {}): Promise<JMAQuake[]> {
    // Validate parameters
    validateQuakeQuery(options);

    // Build query string
    const params = toApiParams(options);
    const url = buildQueryUrl(this.baseUrl + REST_ENDPOINTS.JMA_QUAKE, params);

    // Make request
    const data = await this.request<JMAQuake[]>(url);

    // Validate response
    if (!Array.isArray(data)) {
      throw new ValidationError('API response is not an array', data);
    }

    // Validate each item
    for (const item of data) {
      if (!validateEvent(item, 551)) {
        throw new ValidationError('Invalid JMAQuake data in response', item);
      }
    }

    return data;
  }

  /**
   * Get JMA Tsunami data (list)
   *
   * @param options - Query parameters for filtering
   * @returns Promise resolving to array of JMATsunami events
   * @throws {ValidationError} If query parameters are invalid
   * @throws {P2PQuakeError} If API request fails
   *
   * @example
   * ```typescript
   * const tsunamis = await restClient.getTsunamis({
   *   limit: 5,
   *   sinceDate: '2024-01-01',
   * });
   * ```
   */
  public async getTsunamis(options: TsunamiQueryOptions = {}): Promise<JMATsunami[]> {
    // Validate parameters
    validateTsunamiQuery(options);

    // Build query string
    const params = toApiParams(options);
    const url = buildQueryUrl(this.baseUrl + REST_ENDPOINTS.JMA_TSUNAMI, params);

    // Make request
    const data = await this.request<JMATsunami[]>(url);

    // Validate response
    if (!Array.isArray(data)) {
      throw new ValidationError('API response is not an array', data);
    }

    // Validate each item
    for (const item of data) {
      if (!validateEvent(item, 552)) {
        throw new ValidationError('Invalid JMATsunami data in response', item);
      }
    }

    return data;
  }

  /**
   * Get specific JMA Quake by ID
   *
   * @param id - Earthquake information record identifier
   * @returns Promise resolving to JMAQuake event
   * @throws {ValidationError} If ID is invalid
   * @throws {NotFoundError} If earthquake with ID not found
   * @throws {P2PQuakeError} If API request fails
   *
   * @example
   * ```typescript
   * const quake = await restClient.getQuakeById('20240101120000');
   * ```
   */
  public async getQuakeById(id: string): Promise<JMAQuake> {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new ValidationError('ID must be a non-empty string');
    }

    // Build URL
    const url = this.baseUrl + REST_ENDPOINTS.JMA_QUAKE_BY_ID(id);

    // Make request
    const data = await this.request<JMAQuake>(url, id);

    // Validate response
    if (!validateEvent(data, 551)) {
      throw new ValidationError('Invalid JMAQuake data in response', data);
    }

    return data;
  }

  /**
   * Get specific JMA Tsunami by ID
   *
   * @param id - Tsunami forecast record identifier
   * @returns Promise resolving to JMATsunami event
   * @throws {ValidationError} If ID is invalid
   * @throws {NotFoundError} If tsunami with ID not found
   * @throws {P2PQuakeError} If API request fails
   *
   * @example
   * ```typescript
   * const tsunami = await restClient.getTsunamiById('20240101120000');
   * ```
   */
  public async getTsunamiById(id: string): Promise<JMATsunami> {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new ValidationError('ID must be a non-empty string');
    }

    // Build URL
    const url = this.baseUrl + REST_ENDPOINTS.JMA_TSUNAMI_BY_ID(id);

    // Make request
    const data = await this.request<JMATsunami>(url, id);

    // Validate response
    if (!validateEvent(data, 552)) {
      throw new ValidationError('Invalid JMATsunami data in response', data);
    }

    return data;
  }

  /**
   * Internal method to make HTTP requests
   *
   * @param url - Complete URL with query parameters
   * @param id - Optional ID for error messages (for by-ID endpoints)
   * @returns Promise resolving to response data
   */
  private async request<T>(url: string, id?: string): Promise<T> {
    // Wait for rate limiter
    await this.rateLimiter?.acquire();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        throw await this.handleHttpError(response, id);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new P2PQuakeError(`Request timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Handle HTTP error responses
   *
   * @param response - HTTP response
   * @param id - Optional ID for error messages
   * @returns Promise resolving to appropriate error
   */
  private async handleHttpError(response: Response, id?: string): Promise<Error> {
    const status = response.status;

    try {
      const errorData = (await response.json()) as { message?: string };

      switch (status) {
        case 400:
          return new ValidationError(
            `Invalid query parameters: ${errorData.message || 'Bad Request'}`,
            errorData
          );
        case 404:
          return new NotFoundError(id ? `Resource not found: ${id}` : 'Resource not found', id);
        case 429:
          return new RateLimitError('Rate limit exceeded');
        case 500:
        case 502:
        case 503:
          return new P2PQuakeError(`Server error: ${status}`);
        default:
          return new P2PQuakeError(`HTTP error ${status}: ${response.statusText}`);
      }
    } catch {
      // If error response is not JSON, use simple error message
      switch (status) {
        case 400:
          return new ValidationError('Invalid query parameters');
        case 404:
          return new NotFoundError(id ? `Resource not found: ${id}` : 'Resource not found', id);
        case 429:
          return new RateLimitError('Rate limit exceeded');
        case 500:
        case 502:
        case 503:
          return new P2PQuakeError(`Server error: ${status}`);
        default:
          return new P2PQuakeError(`HTTP error ${status}: ${response.statusText}`);
      }
    }
  }
}
