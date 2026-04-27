import "server-only";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { slugify } from "@/server/lib/slug";

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  imageUrl: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: z.enum(["active", "inactive"]).default("active"),
  navGroup: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sortOrder: z.number().int().min(0).default(0),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export async function listAdminCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();
}

export async function getAdminCategory(id: number) {
  const c = await db.select().from(categories).where(eq(categories.id, id)).get();
  if (!c) throw errors.notFound("Category not found");
  return c;
}

export async function createCategory(input: CategoryInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const dup = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();
  if (dup) throw errors.conflict(`Slug "${slug}" already exists`);

  const [created] = await db
    .insert(categories)
    .values({
      name: input.name,
      slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      navGroup: input.navGroup ?? null,
      sortOrder: input.sortOrder,
    })
    .returning();
  return created!;
}

export async function updateCategory(id: number, input: CategoryInput) {
  const existing = await getAdminCategory(id);
  const slug = input.slug?.trim() || slugify(input.name);
  if (slug !== existing.slug) {
    const dup = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .get();
    if (dup && dup.id !== id)
      throw errors.conflict(`Slug "${slug}" already exists`);
  }
  await db
    .update(categories)
    .set({
      name: input.name,
      slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      navGroup: input.navGroup ?? null,
      sortOrder: input.sortOrder,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(categories.id, id));
  return { ok: true };
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  return { ok: true };
}
