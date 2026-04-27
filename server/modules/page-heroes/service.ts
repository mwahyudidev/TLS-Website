import "server-only";
import { db } from "@/db/client";
import { pageHeroes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function listPageHeroes() {
  return db.select().from(pageHeroes).orderBy(asc(pageHeroes.id)).all();
}

export async function getPageHero(pageKey: string) {
  const [hero] = await db
    .select()
    .from(pageHeroes)
    .where(eq(pageHeroes.pageKey, pageKey))
    .all();
  return hero ?? null;
}

export async function getPageHeroById(id: number) {
  const [hero] = await db
    .select()
    .from(pageHeroes)
    .where(eq(pageHeroes.id, id))
    .all();
  if (!hero) throw errors.notFound("Page hero not found");
  return hero;
}

export async function upsertPageHero(
  pageKey: string,
  data: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    status?: "active" | "inactive";
  },
) {
  const now = Math.floor(Date.now() / 1000);
  const [hero] = await db
    .insert(pageHeroes)
    .values({ pageKey, ...data, updatedAt: now })
    .onConflictDoUpdate({
      target: pageHeroes.pageKey,
      set: { ...data, updatedAt: now },
    })
    .returning();
  return hero!;
}

export async function deletePageHero(id: number) {
  await getPageHeroById(id);
  await db.delete(pageHeroes).where(eq(pageHeroes.id, id));
}
