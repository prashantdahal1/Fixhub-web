import { evaluatePromoCode, type PromoService, type PromoUser } from '../lib/promo-codes';

describe('Promo Code Evaluation Unit Tests', () => {
  const baseService: PromoService = {
    basePrice: 2000,
    category: 'other',
  };

  it('should return error message when code is empty or whitespace', () => {
    const res = evaluatePromoCode('   ', baseService);
    expect(res.valid).toBe(false);
    expect(res.message).toBe('Please enter a promo code.');
    expect(res.discount).toBe(0);
  });

  it('should apply 30% discount for FIXHUB30, FIRST30, WELCOME30', () => {
    ['FIXHUB30', 'first30', 'welcome30'].forEach((code) => {
      const res = evaluatePromoCode(code, baseService);
      expect(res.valid).toBe(true);
      expect(res.discount).toBe(600); // 30% of 2000
    });
  });

  it('should apply fixed discount for PROMO500 capped at service price', () => {
    const resHigh = evaluatePromoCode('PROMO500', baseService);
    expect(resHigh.valid).toBe(true);
    expect(resHigh.discount).toBe(500);

    const cheapService: PromoService = { basePrice: 300, category: 'other' };
    const resCheap = evaluatePromoCode('SAVE500', cheapService);
    expect(resCheap.valid).toBe(true);
    expect(resCheap.discount).toBe(300);
  });

  it('should require a verified account for FIRSTFIX10', () => {
    const unverifiedUser: PromoUser = { isVerified: false };
    const resUnverified = evaluatePromoCode('FIRSTFIX10', baseService, unverifiedUser);
    expect(resUnverified.valid).toBe(false);
    expect(resUnverified.message).toContain('requires a verified account');

    const verifiedUser: PromoUser = { isVerified: true };
    const resVerified = evaluatePromoCode('FIRSTFIX10', baseService, verifiedUser);
    expect(resVerified.valid).toBe(true);
    expect(resVerified.discount).toBe(200); // 10% of 2000
  });

  it('should enforce category and minimum price rules for GEYSER30', () => {
    const nonGeyser: PromoService = { basePrice: 1500, category: 'plumber' };
    expect(evaluatePromoCode('GEYSER30', nonGeyser).valid).toBe(false);

    const cheapGeyser: PromoService = { basePrice: 800, category: 'geyser' };
    expect(evaluatePromoCode('GEYSER30', cheapGeyser).valid).toBe(false);

    const validGeyser: PromoService = { basePrice: 1500, category: 'geyser' };
    const res = evaluatePromoCode('GEYSER30', validGeyser);
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(450);
  });

  it('should return invalid for unknown promo codes', () => {
    const res = evaluatePromoCode('FAKECODE99', baseService);
    expect(res.valid).toBe(false);
    expect(res.message).toBe('Invalid promo code.');
  });
});
