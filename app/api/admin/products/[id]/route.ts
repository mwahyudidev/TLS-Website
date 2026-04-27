import { ok, fail, parseJson, noContent } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  getAdminProduct,
  updateProduct,
  deleteProduct,
  productInputSchema,
} from "@/server/modules/products/admin";

function pid(id: string): number {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw errors.validation("Invalid id");
  return n;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getAdminProduct(pid(id)));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const input = await parseJson(req, productInputSchema);
    await updateProduct(pid(id), input);
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteProduct(pid(id));
    return noContent();
  } catch (e) {
    return fail(e);
  }
}
