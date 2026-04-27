import "server-only";
import { z } from "zod";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  products,
  productImages,
  productCategories,
  categories,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { slugify } from "@/server/lib/slug";

export const productInputSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  priceCents: z.number().int().min(0),
  compareAtPriceCents: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0),
  sku: z.string().min(1).max(60).trim(),
  weightGrams: z.number().int().min(0).default(0),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  featured: z.boolean().default(false),
  imageUrl: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categoryIds: z.array(z.number().int().positive()).default([]),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export async function listAdminProducts(opts: {
  q?: string;
  status?: "draft" | "active" | "archived";
  page?: number;
  perPage?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(500, Math.max(1, opts.perPage ?? 25));
  const conds: SQL[] = [];
  if (opts.status) conds.push(eq(products.status, opts.status));
  if (opts.q) {
    const term = `%${opts.q.toLowerCase()}%`;
    conds.push(
      or(
        like(sql`lower(${products.name})`, term),
        like(sql`lower(${products.sku})`, term),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(products.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  const total = await db
    .select({ c: sql<number>`count(*)` })
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .get();

  return {
    data: rows,
    meta: {
      page,
      perPage,
      total: total?.c ?? 0,
      totalPages: Math.ceil((total?.c ?? 0) / perPage),
    },
  };
}

export async function getAdminProduct(id: number) {
  const product = await db.select().from(products).where(eq(products.id, id)).get();
  if (!product) throw errors.notFound("Product not found");
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .all();
  const cats = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(productCategories)
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(eq(productCategories.productId, id))
    .all();
  return { product, images, categories: cats };
}

export async function createProduct(input: ProductInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  // Ensure slug uniqueness
  const existingSlug = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .get();
  if (existingSlug) throw errors.conflict(`Slug "${slug}" is already in use`);

  const existingSku = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.sku, input.sku))
    .get();
  if (existingSku) throw errors.conflict(`SKU "${input.sku}" is already in use`);

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(products)
      .values({
        name: input.name,
        slug,
        description: input.description ?? null,
        priceCents: input.priceCents,
        compareAtPriceCents: input.compareAtPriceCents ?? null,
        stock: input.stock,
        sku: input.sku,
        weightGrams: input.weightGrams,
        status: input.status,
        featured: input.featured,
      })
      .returning();

    if (input.imageUrl) {
      await tx.insert(productImages).values({
        productId: created!.id,
        url: input.imageUrl,
        altText: input.name,
        sortOrder: 0,
      });
    }

    for (const catId of input.categoryIds) {
      await tx
        .insert(productCategories)
        .values({ productId: created!.id, categoryId: catId });
    }

    return created!;
  });
}

export async function updateProduct(id: number, input: ProductInput) {
  const existing = await db.select().from(products).where(eq(products.id, id)).get();
  if (!existing) throw errors.notFound("Product not found");

  const slug = input.slug?.trim() || slugify(input.name);
  if (slug !== existing.slug) {
    const dup = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .get();
    if (dup && dup.id !== id) throw errors.conflict(`Slug "${slug}" is already in use`);
  }
  if (input.sku !== existing.sku) {
    const dup = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, input.sku))
      .get();
    if (dup && dup.id !== id) throw errors.conflict(`SKU "${input.sku}" is already in use`);
  }

  return db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        name: input.name,
        slug,
        description: input.description ?? null,
        priceCents: input.priceCents,
        compareAtPriceCents: input.compareAtPriceCents ?? null,
        stock: input.stock,
        sku: input.sku,
        weightGrams: input.weightGrams,
        status: input.status,
        featured: input.featured,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(products.id, id));

    await tx.delete(productCategories).where(eq(productCategories.productId, id));
    for (const catId of input.categoryIds) {
      await tx
        .insert(productCategories)
        .values({ productId: id, categoryId: catId });
    }

    if (input.imageUrl) {
      const hasImage = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.productId, id))
        .get();
      if (hasImage) {
        await tx
          .update(productImages)
          .set({ url: input.imageUrl, updatedAt: Math.floor(Date.now() / 1000) })
          .where(eq(productImages.id, hasImage.id));
      } else {
        await tx.insert(productImages).values({
          productId: id,
          url: input.imageUrl,
          altText: input.name,
          sortOrder: 0,
        });
      }
    }
    return { ok: true };
  });
}

export async function deleteProduct(id: number) {
  // Soft archive — preserves order_items snapshots.
  await db
    .update(products)
    .set({ status: "archived", updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(products.id, id));
  return { ok: true };
}
