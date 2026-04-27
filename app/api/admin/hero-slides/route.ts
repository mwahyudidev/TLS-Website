import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listHeroSlides, createHeroSlide } from "@/server/modules/hero-slides/service";
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

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listHeroSlides());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, heroSlideSchema);
    return ok(await createHeroSlide(data));
  } catch (e) {
    return fail(e);
  }
}
