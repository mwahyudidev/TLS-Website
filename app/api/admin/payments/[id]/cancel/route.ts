import { ok, fail, maybeReadNotes } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { cancelPayment } from "@/server/modules/payments/service";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await ctx.params;
    const pid = Number(id);
    if (!Number.isInteger(pid) || pid <= 0)
      throw errors.validation("Invalid id");
    const notes = await maybeReadNotes(req);
    return ok(await cancelPayment(pid, { by: user, notes }));
  } catch (e) {
    return fail(e);
  }
}
