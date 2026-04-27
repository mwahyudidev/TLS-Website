import "server-only";
import { and, asc, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  products,
  productImages,
  productCategories,
  categories,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  featured: boolean;
  imageUrl: string | null;
  categoryNames: string[];
};

export type ProductDetail = ProductSummary & {
  description: string | null;
  sku: string;
  weightGrams: number;
  images: { url: string; alt: string | null }[];
};

export type ListOptions = {
  search?: string;
  categorySlug?: string;
  navGroup?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  minPrice?: number; // dollars
  maxPrice?: number;
  page?: number;
  perPage?: number;
};

export async function listProducts(opts: ListOptions = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(48, Math.max(1, opts.perPage ?? 12));
  const offset = (page - 1) * perPage;

  let categoryId: number | undefined;
  let categoryIds: number[] | undefined;

  if (opts.navGroup) {
    const cats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.navGroup, opts.navGroup))
      .all();
    categoryIds = cats.map((c) => c.id);
  } else if (opts.categorySlug) {
    const c = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, opts.categorySlug))
      .get();
    if (c) categoryId = c.id;
  }

  const hasCatFilter =
    categoryId !== undefined || (categoryIds && categoryIds.length > 0);
  const catCond =
    categoryId !== undefined
      ? eq(productCategories.categoryId, categoryId)
      : categoryIds?.length
        ? inArray(productCategories.categoryId, categoryIds)
        : undefined;

  const conds = [eq(products.status, "active")];
  if (opts.search) {
    const term = `%${opts.search.toLowerCase()}%`;
    conds.push(
      or(
        like(sql`lower(${products.name})`, term),
        like(sql`lower(${products.description})`, term),
        like(sql`lower(${products.sku})`, term),
      )!,
    );
  }
  if (typeof opts.minPrice === "number")
    conds.push(gte(products.priceCents, Math.round(opts.minPrice * 100)));
  if (typeof opts.maxPrice === "number")
    conds.push(lte(products.priceCents, Math.round(opts.maxPrice * 100)));

  const orderBy =
    opts.sort === "price-asc"
      ? asc(products.priceCents)
      : opts.sort === "price-desc"
        ? desc(products.priceCents)
        : opts.sort === "name"
          ? asc(products.name)
          : desc(products.createdAt);

  const productCols = {
    id: products.id,
    name: products.name,
    slug: products.slug,
    priceCents: products.priceCents,
    compareAtPriceCents: products.compareAtPriceCents,
    stock: products.stock,
    featured: products.featured,
    createdAt: products.createdAt,
  };

  const baseQuery = hasCatFilter
    ? db
        .selectDistinct(productCols)
        .from(products)
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .where(and(...conds, catCond!))
    : db.select(productCols).from(products).where(and(...conds));

  const rows = await baseQuery.orderBy(orderBy).limit(perPage).offset(offset).all();

  // Total count
  const totalRow = hasCatFilter
    ? await db
        .select({ count: sql<number>`count(distinct ${products.id})` })
        .from(products)
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .where(and(...conds, catCond!))
        .get()
    : await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conds))
        .get();
  const total = totalRow?.count ?? 0;

  // Hydrate images + categories per product
  const ids = rows.map((r) => r.id);
  const imagesByProd = new Map<number, string>();
  const catsByProd = new Map<number, string[]>();
  if (ids.length > 0) {
    const imgs = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(sql`${productImages.productId} IN ${ids}`)
      .orderBy(asc(productImages.sortOrder))
      .all();
    for (const i of imgs) {
      if (!imagesByProd.has(i.productId)) imagesByProd.set(i.productId, i.url);
    }

    const cats = await db
      .select({
        productId: productCategories.productId,
        name: categories.name,
      })
      .from(productCategories)
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(sql`${productCategories.productId} IN ${ids}`)
      .all();
    for (const c of cats) {
      const arr = catsByProd.get(c.productId) ?? [];
      arr.push(c.name);
      catsByProd.set(c.productId, arr);
    }
  }

  const data: ProductSummary[] = rows.map((r) => ({
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

  return {
    data,
    meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const p = await db.select().from(products).where(eq(products.slug, slug)).get();
  if (!p || p.status !== "active") throw errors.notFound("Product not found");

  const imgs = await db
    .select({
      url: productImages.url,
      altText: productImages.altText,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, p.id))
    .orderBy(asc(productImages.sortOrder))
    .all();

  const cats = await db
    .select({ name: categories.name })
    .from(productCategories)
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(eq(productCategories.productId, p.id))
    .all();

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    stock: p.stock,
    sku: p.sku,
    weightGrams: p.weightGrams,
    featured: p.featured,
    imageUrl: imgs[0]?.url ?? null,
    images: imgs.map((i) => ({ url: i.url, alt: i.altText })),
    categoryNames: cats.map((c) => c.name),
  };
}

export async function getFeaturedProducts(limit = 8) {
  const { data } = await listProducts({ perPage: limit });
  return data.filter((p) => p.featured).slice(0, limit);
}

export async function getLatestProducts(limit = 8) {
  const { data } = await listProducts({ sort: "newest", perPage: limit });
  return data;
}

export async function getRelatedProducts(productId: number, limit = 4) {
  const cats = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId))
    .all();
  const catIds = cats.map((c) => c.categoryId);
  if (catIds.length === 0) return [];

  const prodIds = await db
    .selectDistinct({ id: productCategories.productId })
    .from(productCategories)
    .where(
      and(
        sql`${productCategories.categoryId} IN ${catIds}`,
        sql`${productCategories.productId} != ${productId}`,
      ),
    )
    .limit(limit * 2)
    .all();
  const ids = prodIds.map((p) => p.id).slice(0, limit);
  if (ids.length === 0) return [];

  const { data } = await listProducts({ perPage: 50 });
  return data.filter((p) => ids.includes(p.id)).slice(0, limit);
}
