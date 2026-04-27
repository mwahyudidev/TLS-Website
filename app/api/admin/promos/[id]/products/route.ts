import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import { getPromoProductIds, setPromoProducts } from "@/server/modules/promos/admin";
import { z } from "zod";

const schema = z.object({
  productIds: z.array(z.number().int().positive()),
});

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) throw errors.validation("Invalid id");
    return ok(await getPromoProductIds(cid));
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) throw errors.validation("Invalid id");
    const { productIds } = await parseJson(req, schema);
    await setPromoProducts(cid, productIds);
    return ok({ updated: true });
  } catch (e) {
    return fail(e);
  }
}
