import { describe, it, expect } from 'bun:test';
import {
  isBasicData,
  isValidEventCode,
  isP2PQuakeEvent,
  validateEvent,
} from '../src/utils/validator';
import { EVENT_CODES } from '../src/types/constants';

describe('validator utilities', () => {
  describe('isBasicData', () => {
    it('returns false for non-object values', () => {
      expect(isBasicData(null)).toBe(false);
      expect(isBasicData(undefined)).toBe(false);
      expect(isBasicData('string')).toBe(false);
      expect(isBasicData(123)).toBe(false);
    });

    it('returns false when required fields are missing or invalid types', () => {
      expect(isBasicData({})).toBe(false);
      expect(isBasicData({ id: 1, code: 551, time: '2020-01-01T00:00:00Z' })).toBe(false);
      expect(isBasicData({ id: 'id', code: '551', time: '2020-01-01T00:00:00Z' })).toBe(false);
      expect(isBasicData({ id: 'id', code: 551, time: 1234 })).toBe(false);
    });

    it('returns true for valid BasicData-like object', () => {
      const data = { id: 'abc', code: 551, time: '2020-01-01T00:00:00Z' };
      expect(isBasicData(data)).toBe(true);
    });
  });

  describe('isValidEventCode', () => {
    it('returns false for non-number values', () => {
      expect(isValidEventCode('551')).toBe(false);
      expect(isValidEventCode(null)).toBe(false);
      expect(isValidEventCode(undefined)).toBe(false);
    });

    it('returns true only for known EVENT_CODES', () => {
      for (const code of EVENT_CODES) {
        expect(isValidEventCode(code)).toBe(true);
      }

      expect(isValidEventCode(9999)).toBe(false);
    });
  });

  describe('isP2PQuakeEvent', () => {
    it('returns false when basic structure is invalid', () => {
      expect(isP2PQuakeEvent({})).toBe(false);
      expect(isP2PQuakeEvent({ id: 'id', code: 9999, time: '2020-01-01T00:00:00Z' })).toBe(false);
    });

    it('returns true for valid P2PQuakeEvent-like object', () => {
      const data = {
        id: 'id-1',
        code: EVENT_CODES[0],
        time: '2020-01-01T00:00:00Z',
      } as const;

      expect(isP2PQuakeEvent(data)).toBe(true);
    });
  });

  describe('validateEvent', () => {
    it('returns false when not a valid P2PQuakeEvent', () => {
      const code = EVENT_CODES[0];
      expect(validateEvent({}, code)).toBe(false);
    });

    it('returns false when event code does not match expected', () => {
      const [code1, code2] = EVENT_CODES;
      const event = {
        id: 'id-1',
        code: code1,
        time: '2020-01-01T00:00:00Z',
      } as const;

      expect(validateEvent(event, code2)).toBe(false);
    });

    it('returns true when event is valid and code matches', () => {
      const code = EVENT_CODES[0];
      const event = {
        id: 'id-1',
        code,
        time: '2020-01-01T00:00:00Z',
      } as const;

      const result = validateEvent(event, code);
      expect(result).toBe(true);
    });
  });
});
