import { ok, fail, parseJson } from "@/server/lib/api";
import { checkoutSchema } from "@/server/modules/checkout/validators";
import { createOrder } from "@/server/modules/checkout/service";

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, checkoutSchema);
    const result = await createOrder(input);
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
