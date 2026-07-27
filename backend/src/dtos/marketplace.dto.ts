import { z } from "zod";

export const TopUpWalletDTO = z.object({
  amount: z.coerce.number().positive().max(1000000),
});
export type TopUpWalletDTO = z.infer<typeof TopUpWalletDTO>;

export const CreateBookingDTO = z.object({
  serviceId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  address: z.string().trim().min(3),
  notes: z.string().trim().optional(),
  paymentProvider: z.enum(["esewa", "khalti", "cod"]),
  promoCode: z.string().trim().optional(),
});
export type CreateBookingDTO = z.infer<typeof CreateBookingDTO>;

// Alias for clarity: creating a payment intent is the first step of booking
export const CreatePaymentIntentDTO = CreateBookingDTO;
export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentDTO>;

export const UpdateBookingStatusDTO = z.object({
  action: z.enum(["start", "complete", "cancel"]),
});
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusDTO>;

export const CreateReviewDTO = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});
export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;

export const CreateTicketDTO = z.object({
  bookingId: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  technicianName: z.string().trim().optional(),
  category: z.string().trim().min(1),
  description: z.string().trim().min(3),
});
export type CreateTicketDTO = z.infer<typeof CreateTicketDTO>;

export const UpdateTicketStatusDTO = z.object({
  status: z.enum(["Under Review", "In Progress", "Resolved"]),
});
export type UpdateTicketStatusDTO = z.infer<typeof UpdateTicketStatusDTO>;

export const BulkDeleteTicketsDTO = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
export type BulkDeleteTicketsDTO = z.infer<typeof BulkDeleteTicketsDTO>;
