import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { setOrderStatus } from "@/server/modules/orders/admin";
import { ORDER_STATUSES } from "@/db/schema";

const schema = z.object({
  status: z.enum(ORDER_STATUSES),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await ctx.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0)
      throw errors.validation("Invalid id");
    const input = await parseJson(req, schema);
    return ok(
      await setOrderStatus(orderId, input.status, {
        by: user,
        notes: input.notes,
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
