import { z } from 'zod';

export const CreateUserDTO = z.object({
  firstName: z.string().trim(),
  lastName:  z.string().trim(),
  email:     z.string().email(),
  username:  z.string().trim(),
  password:  z.string().min(6),
  role:      z.enum(["customer", "professional"]).optional(),
  phoneNumber: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  stayLoggedIn: z.boolean().optional(),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = z.object({
  firstName: z.string().trim().optional(),
  lastName:  z.string().trim().optional(),
  email:     z.string().email().optional(),
  phoneNumber: z.string().optional(),
  bio:       z.string().optional(),
  country:   z.string().optional(),
  cityState: z.string().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const UpdatePasswordDTO = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;

export const AdminUpdateUserDTO = z.object({
  firstName: z.string().trim().optional(),
  lastName:  z.string().trim().optional(),
  email:     z.string().email().optional(),
  username:  z.string().trim().optional(),
  role:      z.enum(["admin", "customer", "professional"]).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  profilePicture: z.string().optional(),
});

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

export const AdminCreateUserDTO = z.object({
  firstName: z.string().trim(),
  lastName:  z.string().trim(),
  email:     z.string().email(),
  username:  z.string().trim(),
  password:  z.string().min(6),
  role:      z.enum(["admin", "customer", "professional"]).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;