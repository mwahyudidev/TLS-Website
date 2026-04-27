import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listPageHeroes, upsertPageHero } from "@/server/modules/page-heroes/service";
import { z } from "zod";

const pageHeroSchema = z.object({
  pageKey: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listPageHeroes());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { pageKey, ...data } = await parseJson(req, pageHeroSchema);
    return ok(await upsertPageHero(pageKey, data));
  } catch (e) {
    return fail(e);
  }
}
