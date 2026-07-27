import { describe, it, expect } from '@jest/globals';
import { applyHold, applyRelease, applyRefund } from '../../shared/utils/escrow-math.js';

describe('Escrow Math Unit Tests', () => {
  describe('applyHold()', () => {
    it('should correctly move funds from balance to held', () => {
      const res = applyHold(1000, 200, 500);
      expect(res).toEqual({ balance: 500, held: 700 });
    });

    it('should throw error if amount is negative or zero', () => {
      expect(() => applyHold(1000, 0, 0)).toThrow('Amount must be positive');
      expect(() => applyHold(1000, 0, -100)).toThrow('Amount must be positive');
    });

    it('should throw error if balance is less than amount', () => {
      expect(() => applyHold(300, 0, 500)).toThrow('Insufficient balance');
    });
  });

  describe('applyRelease()', () => {
    it('should correctly deduct amount from held funds', () => {
      const res = applyRelease(500, 300);
      expect(res).toEqual({ held: 200 });
    });

    it('should throw error if amount is non-positive or exceeds held', () => {
      expect(() => applyRelease(500, 0)).toThrow('Amount must be positive');
      expect(() => applyRelease(200, 500)).toThrow('Insufficient held funds');
    });
  });

  describe('applyRefund()', () => {
    it('should return held funds back to balance', () => {
      const res = applyRefund(1000, 500, 300);
      expect(res).toEqual({ balance: 1300, held: 200 });
    });

    it('should throw error if refund exceeds held funds', () => {
      expect(() => applyRefund(1000, 200, 300)).toThrow('Insufficient held funds');
    });
  });
});
