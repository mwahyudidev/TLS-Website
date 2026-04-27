import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(6).max(30).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
