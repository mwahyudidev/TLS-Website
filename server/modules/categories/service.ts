import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "@/db/schema";

export async function listActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.status, "active"))
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();
}

export async function getCategoryBySlug(slug: string) {
  return db.select().from(categories).where(eq(categories.slug, slug)).get();
}
