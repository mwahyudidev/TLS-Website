import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { previewCheckout } from "@/server/modules/checkout/service";

const schema = z.object({
  couponCode: z.string().min(1).max(40).trim().optional(),
});

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, schema);
    return ok(await previewCheckout(input));
  } catch (e) {
    return fail(e);
  }
}
