import { ok, fail } from "@/server/lib/api";
import { getCart } from "@/server/modules/cart/service";

export async function GET() {
  try {
    return ok(await getCart());
  } catch (e) {
    return fail(e);
  }
}
