import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  shipmentInputSchema,
  updateShipmentDetails,
} from "@/server/modules/shipments/service";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await ctx.params;
    const sid = Number(id);
    if (!Number.isInteger(sid) || sid <= 0)
      throw errors.validation("Invalid id");
    const input = await parseJson(req, shipmentInputSchema);
    return ok(await updateShipmentDetails(sid, input, { by: user }));
  } catch (e) {
    return fail(e);
  }
}
