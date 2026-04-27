import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  getHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "@/server/modules/hero-slides/service";
import { z } from "zod";

const heroSlideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  slideType: z
    .enum(["welcome", "promo", "subscription", "category", "whatsapp", "custom"])
    .default("custom"),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().default(0),
});

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getHeroSlide(Number(id)));
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
    const data = await parseJson(req, heroSlideSchema.partial());
    return ok(await updateHeroSlide(cid, data));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteHeroSlide(Number(id));
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
