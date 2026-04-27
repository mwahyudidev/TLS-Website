import { ok, fail } from "@/server/lib/api";
import { requireAuth } from "@/server/lib/session";
import { getOrdersByUser } from "@/server/modules/orders/service";

export async function GET() {
  try {
    const user = await requireAuth();
    return ok(await getOrdersByUser(user.id));
  } catch (e) {
    return fail(e);
  }
}
