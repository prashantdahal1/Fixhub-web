import { z } from "zod";

export const CreateUserDTO = z.object({
  firstName: z.string().trim(),
  lastName:  z.string().trim(),
  email:     z.string().email(),
  username:  z.string().trim(),
  password:  z.string().min(6),
  role:      z.enum(["admin", "user", "customer", "professional"]).optional(),
  phoneNumber: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;