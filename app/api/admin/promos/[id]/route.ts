import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  getAdminPromo,
  updatePromo,
  deletePromo,
  promoSchema,
} from "@/server/modules/promos/admin";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getAdminPromo(Number(id)));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) throw errors.validation("Invalid id");
    const data = await parseJson(req, promoSchema.partial());
    return ok(await updatePromo(cid, data));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deletePromo(Number(id));
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
