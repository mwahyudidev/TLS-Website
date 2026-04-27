import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { updateMessageStatus } from "@/server/modules/contact/service";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) throw errors.validation("Invalid id");
    const { status } = await parseJson(req, statusSchema);
    return ok(await updateMessageStatus(cid, status));
  } catch (e) {
    return fail(e);
  }
}
