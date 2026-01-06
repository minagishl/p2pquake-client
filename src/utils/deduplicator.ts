/**
 * Event deduplication manager with time-windowed ID tracking
 *
 * Prevents duplicate event processing by tracking seen event IDs.
 * Automatically cleans up old IDs to prevent memory leaks.
 */
export class Deduplicator {
  private seenIds: Map<string, number>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Create a new deduplicator
   *
   * @param windowMs - Time window in milliseconds to track IDs (default: 60000ms = 1 minute)
   */
  constructor(private windowMs: number = 60000) {
    this.seenIds = new Map();
    this.startCleanup();
  }

  /**
   * Check if an ID has been seen within the time window
   *
   * @param id - Event ID to check
   * @returns true if duplicate (already seen), false if new
   */
  public isDuplicate(id: string): boolean {
    const now = Date.now();
    const timestamp = this.seenIds.get(id);

    if (timestamp !== undefined) {
      // Check if ID is still within the time window
      if (now - timestamp < this.windowMs) {
        return true; // Duplicate within window
      }
      // ID expired, remove it
      this.seenIds.delete(id);
    }

    this.seenIds.set(id, now);
    return false;
  }

  /**
   * Clear all tracked IDs
   */
  public clear(): void {
    this.seenIds.clear();
  }

  /**
   * Stop cleanup timer and clear all data
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Start automatic cleanup of expired IDs
   */
  private startCleanup(): void {
    // Run cleanup at half the window size, with min 1s and max 30s
    const cleanupInterval = Math.max(1000, Math.min(this.windowMs / 2, 30000));

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupInterval);

    // Don't keep the process alive just for cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Remove IDs older than the time window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    for (const [id, timestamp] of this.seenIds.entries()) {
      if (timestamp < cutoff) {
        this.seenIds.delete(id);
      }
    }
  }
}
