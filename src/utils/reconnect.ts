/**
 * Reconnection configuration
 */
export interface ReconnectConfig {
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  multiplier: number;
  /** Maximum reconnection attempts (Infinity for unlimited) */
  maxAttempts: number;
}

/**
 * Exponential backoff reconnection manager
 *
 * Implements reconnection logic with exponential backoff:
 * - delay = min(initialDelay * (multiplier ^ attempt), maxDelay)
 * - Example with defaults: 1s, 2s, 4s, 8s, 16s, 30s, 30s...
 */
export class ReconnectManager {
  private attempts = 0;
  private timeout: NodeJS.Timeout | null = null;

  /**
   * Create a new reconnection manager
   *
   * @param config - Reconnection configuration
   */
  constructor(private config: ReconnectConfig) {}

  /**
   * Calculate the next reconnection delay based on current attempt count
   *
   * @returns Delay in milliseconds
   */
  public getNextDelay(): number {
    const { initialDelay, maxDelay, multiplier } = this.config;
    const exponentialDelay = initialDelay * Math.pow(multiplier, this.attempts);
    return Math.min(exponentialDelay, maxDelay);
  }

  /**
   * Check if reconnection should be attempted
   *
   * @returns true if should reconnect, false if max attempts reached
   */
  public shouldReconnect(): boolean {
    return this.attempts < this.config.maxAttempts;
  }

  /**
   * Schedule a reconnection attempt
   *
   * @param callback - Function to call after delay
   */
  public scheduleReconnect(callback: () => void): void {
    // Cancel any existing timeout
    this.cancel();

    if (!this.shouldReconnect()) {
      return;
    }

    this.attempts++;
    const delay = this.getNextDelay();

    this.timeout = setTimeout(() => {
      this.timeout = null;
      callback();
    }, delay);

    // Don't keep the process alive just for reconnection
    if (this.timeout.unref) {
      this.timeout.unref();
    }
  }

  /**
   * Reset attempt counter after successful connection
   */
  public reset(): void {
    this.attempts = 0;
    this.cancel();
  }

  /**
   * Cancel pending reconnection
   */
  public cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
   * Get current attempt count
   */
  public get attemptCount(): number {
    return this.attempts;
  }
}
