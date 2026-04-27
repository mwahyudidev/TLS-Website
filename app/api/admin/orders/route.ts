import { z } from "zod";
import { ok, fail, parseQuery } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAdminOrders } from "@/server/modules/orders/admin";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
} from "@/db/schema";

const querySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  payment: z.enum(PAYMENT_STATUSES).optional(),
  shipping: z.enum(SHIPPING_STATUSES).optional(),
  q: z.string().optional(),
  fromUnix: z.coerce.number().int().min(0).optional(),
  toUnix: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = parseQuery(req, querySchema);
    return ok(await listAdminOrders(q));
  } catch (e) {
    return fail(e);
  }
}
