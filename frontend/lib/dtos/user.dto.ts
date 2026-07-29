import { z } from "zod";

// Login DTO with explicit validation messages
export const LoginUserDTO = z.object({
  email:    z.string({ required_error: "Email is required" }).email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// Registration DTO (CreateUserDTO) with full fields
export const CreateUserDTO = z.object({
  firstName: z.string({ required_error: "First name is required" }).min(1, "First name cannot be empty"),
  lastName:  z.string({ required_error: "Last name is required" }).min(1, "Last name cannot be empty"),
  email:     z.string({ required_error: "Email is required" }).email("Invalid email address"),
  username:  z.string({ required_error: "Username is required" }).min(3, "Username must be at least 3 characters"),
  password:  z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
  role:      z.enum(["customer", "professional"]).optional(),
  phoneNumber: z.string().optional(),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
