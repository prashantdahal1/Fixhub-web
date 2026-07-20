import type { BookingAction, BookingStatus } from "../models/booking.model.js";

/** Pure state-machine map — exported for unit tests. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, Partial<Record<BookingAction, BookingStatus>>> = {
  confirmed: {
    start: "in_progress",
    cancel: "cancelled",
  },
  in_progress: {
    complete: "completed",
    cancel: "cancelled",
  },
  completed: {},
  cancelled: {},
};

export function resolveNextStatus(
  current: BookingStatus,
  action: BookingAction
): BookingStatus {
  const next = BOOKING_TRANSITIONS[current]?.[action];
  if (!next) {
    throw new Error(`Invalid transition: cannot '${action}' from '${current}'`);
  }
  return next;
}

export function canTransition(current: BookingStatus, action: BookingAction): boolean {
  return !!BOOKING_TRANSITIONS[current]?.[action];
}
