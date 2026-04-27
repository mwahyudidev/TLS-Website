import { ok, fail } from "@/server/lib/api";
import { requireAuth } from "@/server/lib/session";
import { getOrderForUser } from "@/server/modules/orders/service";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const user = await requireAuth();
    const { orderNumber } = await ctx.params;
    return ok(await getOrderForUser(orderNumber, user.id));
  } catch (e) {
    return fail(e);
  }
}
