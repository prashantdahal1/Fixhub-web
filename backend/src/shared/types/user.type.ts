import { z } from 'zod';

export const UserSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(["customer", "professional", "admin"]).default("customer"),
    phoneNumber: z.string().optional(),
    isVerified: z.boolean().default(false).optional(),
    verificationDocument: z.string().optional()
});

export type UserType = z.infer<typeof UserSchema>;
