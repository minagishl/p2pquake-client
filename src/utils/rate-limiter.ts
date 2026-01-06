import { RateLimitConfig } from '../types/rest';

/**
 * Token bucket rate limiter
 *
 * Implements a token bucket algorithm for rate limiting:
 * - Bucket starts with maxRequests tokens
 * - Each request consumes one token
 * - Tokens refill at a constant rate (maxRequests per windowMs)
 * - Requests wait if no tokens available
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: Array<() => void> = [];
  private processing = false;

  constructor(private config: RateLimitConfig) {
    this.tokens = config.maxRequests;
    this.lastRefill = Date.now();
  }

  /**
   * Acquire a token, waiting if necessary
   *
   * @returns Promise that resolves when a token is available
   */
  public async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    const process = () => {
      this.refillTokens();

      if (this.tokens > 0 && this.queue.length > 0) {
        this.tokens--;
        const resolve = this.queue.shift();
        if (resolve) {
          resolve();
        }

        // Continue processing
        if (this.queue.length > 0) {
          process();
        } else {
          this.processing = false;
        }
      } else if (this.queue.length > 0) {
        // Wait until next refill
        const now = Date.now();
        const timeSinceRefill = now - this.lastRefill;
        const timeToNextRefill = this.config.windowMs - timeSinceRefill;

        setTimeout(() => process(), Math.max(0, timeToNextRefill));
      } else {
        this.processing = false;
      }
    };

    process();
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed >= this.config.windowMs) {
      this.tokens = this.config.maxRequests;
      this.lastRefill = now;
    }
  }
}
