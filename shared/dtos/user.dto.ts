import { z } from "zod";

// Login DTO with explicit validation messages
export const LoginUserDTO = z.object({
  email:    z.string({ required_error: "Email is required" }).email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
