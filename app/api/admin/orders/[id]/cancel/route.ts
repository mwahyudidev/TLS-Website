import { ok, fail, maybeReadNotes } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { cancelOrder } from "@/server/modules/orders/admin";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await ctx.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0)
      throw errors.validation("Invalid id");
    const notes = await maybeReadNotes(req);
    return ok(await cancelOrder(orderId, { by: user, notes }));
  } catch (e) {
    return fail(e);
  }
}
