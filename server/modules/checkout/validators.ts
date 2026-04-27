import { z } from "zod";
import { PAYMENT_PROVIDERS } from "@/db/schema";

export const selectedShippingSchema = z.object({
  serviceId: z.string().min(1).max(100),
  courierId: z.string().min(1).max(100),
  courierName: z.string().min(1).max(100),
  serviceName: z.string().min(1).max(100),
  priceCents: z.number().int().min(0),
});

export type SelectedShipping = z.infer<typeof selectedShippingSchema>;

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().min(6).max(30).trim(),
  }),
  shippingAddress: z.object({
    recipientName: z.string().min(2).max(100).trim(),
    addressLine: z.string().min(3).max(200).trim(),
    addressLine2: z.string().max(200).trim().optional(),
    city: z.string().min(1).max(100).trim(),
    province: z.string().max(100).trim().optional(),
    postalCode: z.string().min(2).max(20).trim(),
    country: z.string().min(2).max(60).trim(),
  }),
  paymentProviderId: z.enum(PAYMENT_PROVIDERS),
  // When EasyParcel is enabled the customer picks a courier rate.
  // Absent = use flat-rate from store settings.
  selectedShipping: selectedShippingSchema.optional(),
  couponCode: z.string().min(1).max(40).trim().optional(),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
