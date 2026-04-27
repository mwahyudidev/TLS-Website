import { z } from "zod";
import { ok, created, fail, parseJson } from "@/server/lib/api";
import { submitAvailabilitySubscription } from "@/server/modules/availability-subscriptions/service";

const schema = z.object({
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional().nullable(),
  productId: z.number().int().positive().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  subscriptionType: z
    .enum(["back_in_stock", "new_arrival", "category_alert", "general_update"])
    .default("back_in_stock"),
  notes: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, schema);
    const record = await submitAvailabilitySubscription(body);
    return created(record);
  } catch (e) {
    return fail(e);
  }
}
