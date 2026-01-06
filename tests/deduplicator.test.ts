import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Deduplicator } from '../src/utils/deduplicator';

describe('Deduplicator', () => {
  let deduplicator: Deduplicator;

  beforeEach(() => {
    deduplicator = new Deduplicator(1000); // 1 second window for testing
  });

  afterEach(() => {
    deduplicator.destroy();
  });

  it('should identify first occurrence as not duplicate', () => {
    const result = deduplicator.isDuplicate('event-123');
    expect(result).toBe(false);
  });

  it('should identify second occurrence as duplicate', () => {
    deduplicator.isDuplicate('event-123');
    const result = deduplicator.isDuplicate('event-123');
    expect(result).toBe(true);
  });

  it('should track multiple different IDs', () => {
    expect(deduplicator.isDuplicate('event-1')).toBe(false);
    expect(deduplicator.isDuplicate('event-2')).toBe(false);
    expect(deduplicator.isDuplicate('event-3')).toBe(false);

    expect(deduplicator.isDuplicate('event-1')).toBe(true);
    expect(deduplicator.isDuplicate('event-2')).toBe(true);
    expect(deduplicator.isDuplicate('event-3')).toBe(true);
  });

  it('should clear all tracked IDs', () => {
    deduplicator.isDuplicate('event-123');
    expect(deduplicator.isDuplicate('event-123')).toBe(true);

    deduplicator.clear();

    expect(deduplicator.isDuplicate('event-123')).toBe(false);
  });

  it('should forget IDs after time window expires', async () => {
    const shortDedup = new Deduplicator(100); // 100ms window

    expect(shortDedup.isDuplicate('event-123')).toBe(false);
    expect(shortDedup.isDuplicate('event-123')).toBe(true);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be treated as new after cleanup
    expect(shortDedup.isDuplicate('event-123')).toBe(false);

    shortDedup.destroy();
  });

  it('should properly destroy and clean up resources', () => {
    deduplicator.isDuplicate('event-123');
    deduplicator.destroy();

    // After destroy, should be able to track again (new instance needed)
    expect(deduplicator.isDuplicate('event-123')).toBe(false);
  });
});
