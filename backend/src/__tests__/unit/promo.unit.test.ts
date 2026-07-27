import { jest, describe, it, expect } from '@jest/globals';
import { calculatePromoDiscount, getPromoCodes } from '../../shared/utils/promo.util.js';
import { BookingModel } from '../../models/booking.model.js';

describe('Backend Promo Utility Unit Tests', () => {
  const dummyService = { basePrice: 2000, category: 'other' } as any;
  const dummyUser = { _id: 'user123', isVerified: true } as any;

  it('should return list of promo codes', () => {
    const codes = getPromoCodes();
    expect(codes).toContain('FIXHUB30');
    expect(codes).toContain('FIRSTFIX10');
  });

  it('should return invalid when code is missing or empty', async () => {
    const res = await calculatePromoDiscount('', dummyService, dummyUser);
    expect(res.valid).toBe(false);
    expect(res.discount).toBe(0);
    expect(res.message).toBe('No promo code provided');
  });

  it('should calculate 30% discount for FIXHUB30', async () => {
    const res = await calculatePromoDiscount('FIXHUB30', dummyService, dummyUser);
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(600);
  });

  it('should calculate fixed 500 discount for PROMO500', async () => {
    const res = await calculatePromoDiscount('PROMO500', dummyService, dummyUser);
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(500);
  });

  it('should reject FIRSTFIX10 if user is not verified', async () => {
    const unverifiedUser = { _id: 'user123', isVerified: false } as any;
    const res = await calculatePromoDiscount('FIRSTFIX10', dummyService, unverifiedUser);
    expect(res.valid).toBe(false);
    expect(res.message).toContain('requires a verified account');
  });

  it('should reject FIRSTFIX10 if user has prior bookings', async () => {
    jest.spyOn(BookingModel, 'exists').mockResolvedValueOnce(true as any);
    const res = await calculatePromoDiscount('FIRSTFIX10', dummyService, dummyUser);
    expect(res.valid).toBe(false);
    expect(res.message).toContain('valid only for your first booking');
  });

  it('should apply FIRSTFIX10 if user has no prior bookings', async () => {
    jest.spyOn(BookingModel, 'exists').mockResolvedValueOnce(null as any);
    const res = await calculatePromoDiscount('FIRSTFIX10', dummyService, dummyUser);
    expect(res.valid).toBe(true);
    expect(res.discount).toBe(200);
  });
});
