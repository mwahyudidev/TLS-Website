import "server-only";
import { db } from "@/db/client";
import { recipes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function listPublishedRecipes() {
  return db
    .select()
    .from(recipes)
    .where(eq(recipes.status, "published"))
    .orderBy(recipes.featured, recipes.createdAt)
    .all();
}

export async function getFeaturedRecipes(limit = 3) {
  return db
    .select()
    .from(recipes)
    .where(and(eq(recipes.status, "published"), eq(recipes.featured, true)))
    .orderBy(recipes.createdAt)
    .limit(limit)
    .all();
}

export async function getRecipeBySlug(slug: string) {
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.slug, slug), eq(recipes.status, "published")))
    .all();
  if (!recipe) throw errors.notFound("Recipe not found");
  return recipe;
}
