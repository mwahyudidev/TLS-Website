import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { rateLimit, clientIpFromRequest } from "@/server/lib/rateLimit";
import { getTrackingPayload } from "@/server/modules/tracking/service";

const schema = z.object({
  orderNumber: z.string().min(3).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(req: Request) {
  try {
    const ip = clientIpFromRequest(req);
    rateLimit(`track:${ip}`, { limit: 8, windowSeconds: 60 });
    const input = await parseJson(req, schema);
    return ok(await getTrackingPayload(input.orderNumber, input.email));
  } catch (e) {
    return fail(e);
  }
}
