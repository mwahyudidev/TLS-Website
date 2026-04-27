import { ok, fail } from "@/server/lib/api";
import { errors } from "@/server/lib/errors";
import { rateLimit, clientIpFromRequest } from "@/server/lib/rateLimit";
import { getTrackingPayload } from "@/server/modules/tracking/service";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const ip = clientIpFromRequest(req);
    rateLimit(`track:${ip}`, { limit: 8, windowSeconds: 60 });
    const { orderNumber } = await ctx.params;
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email) throw errors.validation("Email is required");
    return ok(await getTrackingPayload(orderNumber, email));
  } catch (e) {
    return fail(e);
  }
}
