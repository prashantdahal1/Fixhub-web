import { z } from "zod";

export const CreateServiceDTO = z.object({
  title: z.string().trim().optional(), // AI-generated if missing
  description: z.string().trim().optional(), // AI-generated if missing
  shortDescription: z.string().trim().optional(), // AI-generated if missing
  basePrice: z.coerce.number().positive(),
  category: z.enum(["electrician", "plumber", "ac_repair", "painter", "carpenter", "cleaner", "geyser", "appliance_repair", "pest_control", "other"]),
  priceUnit: z.enum(["flat", "per_hour", "per_sqft"]).default("flat"),
  estimatedDuration: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});
export type CreateServiceDTO = z.infer<typeof CreateServiceDTO>;

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

export const UpdateTicketDTO = z.object({
  status: z.enum(["Under Review", "In Progress", "Resolved"]).optional(),
  category: z.string().trim().min(1).optional(),
  technicianName: z.string().trim().optional(),
  description: z.string().trim().min(1).optional(),
});
export type UpdateTicketDTO = z.infer<typeof UpdateTicketDTO>;

export const BulkDeleteTicketsDTO = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
export type BulkDeleteTicketsDTO = z.infer<typeof BulkDeleteTicketsDTO>;

export const AddServiceDuringWorkDTO = z.object({
  bookingId: z.string().min(1),
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().min(10).max(200),
  basePrice: z.coerce.number().positive(),
  category: z.enum(["electrician", "plumber", "ac_repair", "painter", "carpenter", "cleaner", "geyser", "appliance_repair", "pest_control", "other"]),
  priceUnit: z.enum(["flat", "per_hour", "per_sqft"]).default("flat"),
  estimatedDuration: z.string().trim().optional(),
});
export type AddServiceDuringWorkDTO = z.infer<typeof AddServiceDuringWorkDTO>;

export const ApproveServiceDTO = z.object({
  serviceId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().optional(),
});
export type ApproveServiceDTO = z.infer<typeof ApproveServiceDTO>;
