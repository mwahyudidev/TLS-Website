import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { setShipmentStatus } from "@/server/modules/shipments/service";
import { SHIPPING_STATUSES } from "@/db/schema";

const schema = z.object({
  status: z.enum(SHIPPING_STATUSES),
  notes: z.string().max(500).optional(),
});

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
    const input = await parseJson(req, schema);
    return ok(
      await setShipmentStatus(sid, input.status, {
        by: user,
        notes: input.notes,
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
