import "server-only";
import { db } from "@/db/client";
import { recipes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const recipeSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  prepTimeMinutes: z.number().int().optional(),
  cookTimeMinutes: z.number().int().optional(),
  servings: z.number().int().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  ingredients: z.string().optional(),
  instructions: z.string().optional(),
  tips: z.string().optional(),
  status: z.enum(["published", "draft"]).default("published"),
  featured: z.boolean().default(false),
});

export async function listAdminRecipes() {
  return db.select().from(recipes).orderBy(recipes.createdAt).all();
}

export async function getAdminRecipe(id: number) {
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .all();
  if (!recipe) throw errors.notFound("Recipe not found");
  return recipe;
}

export async function createRecipe(data: z.infer<typeof recipeSchema>) {
  const [row] = await db.insert(recipes).values(data).returning();
  return row!;
}

export async function updateRecipe(id: number, data: Partial<z.infer<typeof recipeSchema>>) {
  await getAdminRecipe(id);
  const [row] = await db
    .update(recipes)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(recipes.id, id))
    .returning();
  return row!;
}

export async function deleteRecipe(id: number) {
  await getAdminRecipe(id);
  await db.delete(recipes).where(eq(recipes.id, id));
}
