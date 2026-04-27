import { ok, fail, parseJson } from "@/server/lib/api";
import { addItem } from "@/server/modules/cart/service";
import { addItemSchema } from "@/server/modules/cart/validators";

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, addItemSchema);
    const cart = await addItem(input.productId, input.quantity);
    return ok(cart);
  } catch (e) {
    return fail(e);
  }
}
