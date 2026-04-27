import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { addManualHistoryNote } from "@/server/modules/orders/admin";

const schema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await ctx.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0)
      throw errors.validation("Invalid id");
    const input = await parseJson(req, schema);
    return ok(await addManualHistoryNote(orderId, input, { by: user }));
  } catch (e) {
    return fail(e);
  }
}
