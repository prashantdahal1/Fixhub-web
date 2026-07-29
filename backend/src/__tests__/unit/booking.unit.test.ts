import { BOOKING_TRANSITIONS, resolveNextStatus, canTransition } from '../../modules/booking/booking-state.js';
import type { BookingStatus, BookingAction } from '../../models/booking.model.js';

describe('Booking State Machine Unit Tests', () => {
  describe('canTransition()', () => {
    it('should return true for valid status transitions', () => {
      expect(canTransition('confirmed', 'start')).toBe(true);
      expect(canTransition('confirmed', 'cancel')).toBe(true);
      expect(canTransition('in_progress', 'complete')).toBe(true);
      expect(canTransition('in_progress', 'cancel')).toBe(true);
    });

    it('should return false for invalid transitions from completed or cancelled status', () => {
      expect(canTransition('completed', 'start')).toBe(false);
      expect(canTransition('completed', 'cancel')).toBe(false);
      expect(canTransition('cancelled', 'start')).toBe(false);
      expect(canTransition('cancelled', 'complete')).toBe(false);
    });

    it('should return false when applying wrong actions on confirmed status', () => {
      expect(canTransition('confirmed', 'complete')).toBe(false);
    });
  });

  describe('resolveNextStatus()', () => {
    it('should transition confirmed to in_progress on start', () => {
      expect(resolveNextStatus('confirmed', 'start')).toBe('in_progress');
    });

    it('should transition confirmed to cancelled on cancel', () => {
      expect(resolveNextStatus('confirmed', 'cancel')).toBe('cancelled');
    });

    it('should transition in_progress to completed on complete', () => {
      expect(resolveNextStatus('in_progress', 'complete')).toBe('completed');
    });

    it('should transition in_progress to cancelled on cancel', () => {
      expect(resolveNextStatus('in_progress', 'cancel')).toBe('cancelled');
    });

    it('should throw an Error when invalid transition is attempted', () => {
      expect(() => resolveNextStatus('completed', 'start')).toThrow(
        "Invalid transition: cannot 'start' from 'completed'"
      );
      expect(() => resolveNextStatus('cancelled', 'complete')).toThrow(
        "Invalid transition: cannot 'complete' from 'cancelled'"
      );
    });
  });
});
