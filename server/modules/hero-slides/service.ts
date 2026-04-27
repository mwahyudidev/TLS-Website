import "server-only";
import { db } from "@/db/client";
import { heroSlides } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function listHeroSlides() {
  return db
    .select()
    .from(heroSlides)
    .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.id))
    .all();
}

export async function listActiveHeroSlides() {
  return db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.status, "active"))
    .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.id))
    .all();
}

export async function getHeroSlide(id: number) {
  const [slide] = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.id, id))
    .all();
  if (!slide) throw errors.notFound("Hero slide not found");
  return slide;
}

export async function createHeroSlide(data: {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  slideType?: "welcome" | "promo" | "subscription" | "category" | "whatsapp" | "custom";
  status?: "active" | "inactive";
  sortOrder?: number;
}) {
  const [slide] = await db
    .insert(heroSlides)
    .values({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .returning();
  return slide!;
}

export async function updateHeroSlide(
  id: number,
  data: Partial<{
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaUrl: string;
    slideType: "welcome" | "promo" | "subscription" | "category" | "whatsapp" | "custom";
    status: "active" | "inactive";
    sortOrder: number;
  }>,
) {
  await getHeroSlide(id);
  const [slide] = await db
    .update(heroSlides)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(heroSlides.id, id))
    .returning();
  return slide!;
}

export async function deleteHeroSlide(id: number) {
  await getHeroSlide(id);
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
}
