import { describe, it, expect, beforeEach } from 'bun:test';
import { ReconnectManager } from '../src/utils/reconnect';

describe('ReconnectManager', () => {
  let manager: ReconnectManager;

  beforeEach(() => {
    manager = new ReconnectManager({
      initialDelay: 1000,
      maxDelay: 30000,
      multiplier: 2,
      maxAttempts: 5,
    });
  });

  it('should calculate exponential backoff delays', () => {
    expect(manager.getNextDelay()).toBe(1000); // 2^0 * 1000
    manager.scheduleReconnect(() => {});
    manager.cancel();

    expect(manager.getNextDelay()).toBe(2000); // 2^1 * 1000
    manager.scheduleReconnect(() => {});
    manager.cancel();

    expect(manager.getNextDelay()).toBe(4000); // 2^2 * 1000
    manager.scheduleReconnect(() => {});
    manager.cancel();

    expect(manager.getNextDelay()).toBe(8000); // 2^3 * 1000
  });

  it('should cap delay at maxDelay', () => {
    const shortManager = new ReconnectManager({
      initialDelay: 1000,
      maxDelay: 5000,
      multiplier: 2,
      maxAttempts: Infinity,
    });

    // Simulate many attempts
    for (let i = 0; i < 10; i++) {
      shortManager.scheduleReconnect(() => {});
      shortManager.cancel();
    }

    const delay = shortManager.getNextDelay();
    expect(delay).toBeLessThanOrEqual(5000);
  });

  it('should track attempt count', () => {
    expect(manager.attemptCount).toBe(0);

    manager.scheduleReconnect(() => {});
    expect(manager.attemptCount).toBe(1);

    manager.cancel();
    manager.scheduleReconnect(() => {});
    expect(manager.attemptCount).toBe(2);
  });

  it('should reset attempt count', () => {
    manager.scheduleReconnect(() => {});
    manager.scheduleReconnect(() => {});
    expect(manager.attemptCount).toBe(2);

    manager.reset();
    expect(manager.attemptCount).toBe(0);
  });

  it('should respect maxAttempts limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(manager.shouldReconnect()).toBe(true);
      manager.scheduleReconnect(() => {});
      manager.cancel();
    }

    expect(manager.shouldReconnect()).toBe(false);
  });

  it('should allow infinite attempts when maxAttempts is Infinity', () => {
    const infiniteManager = new ReconnectManager({
      initialDelay: 1000,
      maxDelay: 30000,
      multiplier: 2,
      maxAttempts: Infinity,
    });

    for (let i = 0; i < 100; i++) {
      expect(infiniteManager.shouldReconnect()).toBe(true);
      infiniteManager.scheduleReconnect(() => {});
      infiniteManager.cancel();
    }
  });

  it('should execute callback after delay', async () => {
    let called = false;

    const fastManager = new ReconnectManager({
      initialDelay: 50,
      maxDelay: 1000,
      multiplier: 2,
      maxAttempts: 5,
    });

    fastManager.scheduleReconnect(() => {
      called = true;
    });

    // Should not be called immediately
    expect(called).toBe(false);

    // Wait for delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(called).toBe(true);
  });

  it('should cancel pending reconnection', async () => {
    let called = false;

    const fastManager = new ReconnectManager({
      initialDelay: 50,
      maxDelay: 1000,
      multiplier: 2,
      maxAttempts: 5,
    });

    fastManager.scheduleReconnect(() => {
      called = true;
    });

    fastManager.cancel();

    // Wait for what would have been the delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(called).toBe(false);
  });
});
