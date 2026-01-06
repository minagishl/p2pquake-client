/**
 * Base error class for all P2P Quake client errors
 */
export class P2PQuakeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'P2PQuakeError';
    Object.setPrototypeOf(this, P2PQuakeError.prototype);
  }
}

/**
 * Error thrown when WebSocket connection fails or is lost
 */
export class ConnectionError extends P2PQuakeError {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

/**
 * Error thrown when received event data is invalid or malformed
 */
export class ValidationError extends P2PQuakeError {
  constructor(
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when reconnection attempts are exhausted
 */
export class ReconnectError extends P2PQuakeError {
  constructor(
    message: string,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'ReconnectError';
    Object.setPrototypeOf(this, ReconnectError.prototype);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends P2PQuakeError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when requested resource is not found (404)
 */
export class NotFoundError extends P2PQuakeError {
  constructor(
    message: string,
    public readonly id?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
