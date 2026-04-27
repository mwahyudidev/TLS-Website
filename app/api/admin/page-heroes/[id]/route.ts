import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { errors } from "@/server/lib/errors";
import {
  getPageHeroById,
  upsertPageHero,
  deletePageHero,
} from "@/server/modules/page-heroes/service";
import { z } from "zod";

const pageHeroPatchSchema = z.object({
  pageKey: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return ok(await getPageHeroById(Number(id)));
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
    const patch = await parseJson(req, pageHeroPatchSchema);

    // Merge with the current record so required fields are always present
    const current = await getPageHeroById(cid);
    const resolvedPageKey = patch.pageKey ?? current.pageKey;
    const merged = {
      title:    patch.title    ?? current.title,
      subtitle: patch.subtitle ?? current.subtitle ?? undefined,
      imageUrl: patch.imageUrl ?? current.imageUrl ?? undefined,
      ctaLabel: patch.ctaLabel ?? current.ctaLabel ?? undefined,
      ctaUrl:   patch.ctaUrl   ?? current.ctaUrl   ?? undefined,
      status:   patch.status   ?? current.status,
    };

    return ok(await upsertPageHero(resolvedPageKey, merged));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deletePageHero(Number(id));
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
