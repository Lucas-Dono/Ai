/**
 * Tests for Dynamic Context Limits by Tier
 */

import { describe, it, expect } from 'vitest';
import {
  getContextLimit,
  getAllContextLimits,
  getContextMultiplier,
  hasExtendedContext
} from '@/lib/usage/context-limits';

describe('Context Limits', () => {
  describe('getContextLimit', () => {
    it('should return 10 messages for free tier', () => {
      expect(getContextLimit('free')).toBe(10);
    });

    it('should return 30 messages for plus tier', () => {
      expect(getContextLimit('plus')).toBe(30);
    });

    it('should return 100 messages for ultra tier', () => {
      expect(getContextLimit('ultra')).toBe(100);
    });

    it('should return default (10) for invalid tier', () => {
      expect(getContextLimit('invalid')).toBe(10);
    });

    it('should return default (10) when no tier specified', () => {
      expect(getContextLimit()).toBe(10);
    });

    it('should be case-insensitive', () => {
      expect(getContextLimit('FREE')).toBe(10);
      expect(getContextLimit('Plus')).toBe(30);
      expect(getContextLimit('ULTRA')).toBe(100);
    });
  });

  describe('getAllContextLimits', () => {
    it('should return all tier limits', () => {
      const limits = getAllContextLimits();
      expect(limits).toEqual({
        free: 10,
        plus: 30,
        ultra: 100,
      });
    });

    it('should return a new object (not reference)', () => {
      const limits1 = getAllContextLimits();
      const limits2 = getAllContextLimits();
      expect(limits1).not.toBe(limits2);
      expect(limits1).toEqual(limits2);
    });
  });

  describe('getContextMultiplier', () => {
    it('should return 1x for free tier', () => {
      expect(getContextMultiplier('free')).toBe(1);
    });

    it('should return 3x for plus tier', () => {
      expect(getContextMultiplier('plus')).toBe(3);
    });

    it('should return 10x for ultra tier', () => {
      expect(getContextMultiplier('ultra')).toBe(10);
    });

    it('should return 1x for invalid tier', () => {
      expect(getContextMultiplier('invalid')).toBe(1);
    });
  });

  describe('hasExtendedContext', () => {
    it('should return false for free tier', () => {
      expect(hasExtendedContext('free')).toBe(false);
    });

    it('should return true for plus tier', () => {
      expect(hasExtendedContext('plus')).toBe(true);
    });

    it('should return true for ultra tier', () => {
      expect(hasExtendedContext('ultra')).toBe(true);
    });

    it('should return false for invalid tier', () => {
      expect(hasExtendedContext('invalid')).toBe(false);
    });
  });

  describe('Business logic validation', () => {
    it('should maintain correct ratio: plus is 3x free', () => {
      const freeLimit = getContextLimit('free');
      const plusLimit = getContextLimit('plus');
      expect(plusLimit).toBe(freeLimit * 3);
    });

    it('should maintain correct ratio: ultra is 10x free', () => {
      const freeLimit = getContextLimit('free');
      const ultraLimit = getContextLimit('ultra');
      expect(ultraLimit).toBe(freeLimit * 10);
    });

    it('should have ascending limits: free < plus < ultra', () => {
      const free = getContextLimit('free');
      const plus = getContextLimit('plus');
      const ultra = getContextLimit('ultra');

      expect(free).toBeLessThan(plus);
      expect(plus).toBeLessThan(ultra);
    });
  });
});
