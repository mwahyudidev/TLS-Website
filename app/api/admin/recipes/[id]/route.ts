import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { getAdminRecipe, updateRecipe, deleteRecipe, recipeSchema } from "@/server/modules/recipes/admin";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getAdminRecipe(Number(id)));
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
    const data = await parseJson(req, recipeSchema.partial());
    return ok(await updateRecipe(cid, data));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteRecipe(Number(id));
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
