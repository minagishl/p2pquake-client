import { describe, it, expect } from 'bun:test';
import { P2PQuakeError, ConnectionError, ValidationError, ReconnectError } from '../src/errors';

describe('P2PQuakeError hierarchy', () => {
  it('should create base P2PQuakeError with correct name and message', () => {
    const error = new P2PQuakeError('base message');

    // Should be instance of both Error and P2PQuakeError
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(P2PQuakeError);
    expect(error.name).toBe('P2PQuakeError');
    expect(error.message).toBe('base message');
  });

  it('should create ConnectionError with optional code', () => {
    const error = new ConnectionError('connection failed', 1006);

    // Should inherit from P2PQuakeError
    expect(error).toBeInstanceOf(P2PQuakeError);
    expect(error).toBeInstanceOf(ConnectionError);
    expect(error.name).toBe('ConnectionError');
    expect(error.message).toBe('connection failed');
    expect(error.code).toBe(1006); // WebSocket close code
  });

  it('should create ConnectionError without code', () => {
    const error = new ConnectionError('connection failed');

    // Code should be optional
    expect(error.code).toBeUndefined();
  });

  it('should create ValidationError with optional data', () => {
    const data = { foo: 'bar' };
    const error = new ValidationError('invalid data', data);

    // Should include validation context data
    expect(error).toBeInstanceOf(P2PQuakeError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('invalid data');
    expect(error.data).toEqual(data);
  });

  it('should create ValidationError without data', () => {
    const error = new ValidationError('invalid data');

    // Data should be optional
    expect(error.data).toBeUndefined();
  });

  it('should create ReconnectError with attempts count', () => {
    const error = new ReconnectError('reconnect failed', 3);

    // Should track number of reconnection attempts
    expect(error).toBeInstanceOf(P2PQuakeError);
    expect(error).toBeInstanceOf(ReconnectError);
    expect(error.name).toBe('ReconnectError');
    expect(error.message).toBe('reconnect failed');
    expect(error.attempts).toBe(3);
  });
});
