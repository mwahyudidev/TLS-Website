import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
