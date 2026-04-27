import { ok, fail, parseJson, noContent } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  getAdminCoupon,
  updateCoupon,
  deleteCoupon,
  couponInputSchema,
} from "@/server/modules/coupons/admin";

function pid(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw errors.validation("Invalid id");
  return n;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getAdminCoupon(pid(id)));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const input = await parseJson(req, couponInputSchema);
    return ok(await updateCoupon(pid(id), input));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteCoupon(pid(id));
    return noContent();
  } catch (e) {
    return fail(e);
  }
}
