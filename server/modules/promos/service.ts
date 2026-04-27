import "server-only";
import { db } from "@/db/client";
import {
  weeklyPromos,
  weeklyPromoProducts,
  products,
  productImages,
  productCategories,
  categories,
} from "@/db/schema";
import { eq, and, lte, gte, asc, inArray } from "drizzle-orm";
import type { ProductSummary } from "@/server/modules/products/service";

export type PromoWithProducts = typeof weeklyPromos.$inferSelect & {
  products: ProductSummary[];
};

/* Hydrate a list of product IDs into full ProductSummary objects */
async function hydrateProductIds(ids: number[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      compareAtPriceCents: products.compareAtPriceCents,
      stock: products.stock,
      featured: products.featured,
    })
    .from(products)
    .where(and(eq(products.status, "active"), inArray(products.id, ids)))
    .all();

  const imagesByProd = new Map<number, string>();
  const catsByProd = new Map<number, string[]>();

  const imgs = await db
    .select({ productId: productImages.productId, url: productImages.url, sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.sortOrder))
    .all();
  for (const i of imgs) {
    if (!imagesByProd.has(i.productId)) imagesByProd.set(i.productId, i.url);
  }

  const cats = await db
    .select({ productId: productCategories.productId, name: categories.name })
    .from(productCategories)
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(inArray(productCategories.productId, ids))
    .all();
  for (const c of cats) {
    const arr = catsByProd.get(c.productId) ?? [];
    arr.push(c.name);
    catsByProd.set(c.productId, arr);
  }

  /* Preserve the requested order */
  return ids
    .map((id) => rows.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      priceCents: r.priceCents,
      compareAtPriceCents: r.compareAtPriceCents,
      stock: r.stock,
      featured: r.featured,
      imageUrl: imagesByProd.get(r.id) ?? null,
      categoryNames: catsByProd.get(r.id) ?? [],
    }));
}

export async function listActivePromos(): Promise<PromoWithProducts[]> {
  const now = Math.floor(Date.now() / 1000);

  const activePromos = await db
    .select()
    .from(weeklyPromos)
    .where(
      and(
        eq(weeklyPromos.status, "active"),
        lte(weeklyPromos.validFrom, now),
        gte(weeklyPromos.validUntil, now),
      ),
    )
    .orderBy(weeklyPromos.sortOrder)
    .all();

  if (activePromos.length === 0) return [];

  return Promise.all(
    activePromos.map(async (promo) => {
      const links = await db
        .select({ productId: weeklyPromoProducts.productId })
        .from(weeklyPromoProducts)
        .where(eq(weeklyPromoProducts.promoId, promo.id))
        .orderBy(weeklyPromoProducts.sortOrder)
        .all();
      const promoProducts = await hydrateProductIds(links.map((l) => l.productId));
      return { ...promo, products: promoProducts };
    }),
  );
}

export async function getAllPromos() {
  return db.select().from(weeklyPromos).orderBy(weeklyPromos.sortOrder).all();
}

export async function getPromo(id: number) {
  const promo = await db
    .select()
    .from(weeklyPromos)
    .where(eq(weeklyPromos.id, id))
    .get();
  if (!promo) throw new Error("Promo not found");
  return promo;
}
