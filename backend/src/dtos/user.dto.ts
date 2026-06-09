import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user with explicit validation messages
export const CreateUserDTO = z.object({
  firstName: z.string({ required_error: "First name is required" }).trim(),
  lastName:  z.string({ required_error: "Last name is required" }).trim(),
  email:     z.string({ required_error: "Email is required" }).email("Invalid email address"),
  username:  z.string({ required_error: "Username is required" }).trim(),
  password:  z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO with explicit validation messages
export const LoginUserDTO = z.object({
  email:    z.string({ required_error: "Email is required" }).email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;