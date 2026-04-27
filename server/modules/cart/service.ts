import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { carts, cartItems, products, productImages } from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { getCurrentUser } from "@/server/lib/session";
import { getCartSessionId, getOrCreateCartSessionId } from "./cookie";

export type CartLine = {
  id: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  quantity: number;
  stock: number;
  available: boolean; // active + has stock
  lineSubtotalCents: number;
};

export type CartView = {
  cartId: number | null;
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
};

async function findOrCreateCart(opts: {
  userId?: number | null;
  sessionId?: string | null;
  create: boolean;
}): Promise<number | null> {
  // Prefer user-owned cart when logged in
  if (opts.userId) {
    const c = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, opts.userId))
      .get();
    if (c) return c.id;
  }
  if (opts.sessionId) {
    const c = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.sessionId, opts.sessionId))
      .get();
    if (c) return c.id;
  }
  if (!opts.create) return null;
  if (!opts.userId && !opts.sessionId) {
    throw errors.internal("Cannot create cart without user or session");
  }
  const inserted = await db
    .insert(carts)
    .values({ userId: opts.userId ?? null, sessionId: opts.sessionId ?? null })
    .returning({ id: carts.id });
  return inserted[0]!.id;
}

async function getOrCreateForRequest(create: boolean): Promise<number | null> {
  const user = await getCurrentUser();
  let sessionId = await getCartSessionId();
  if (!user && !sessionId && create) {
    sessionId = await getOrCreateCartSessionId();
  }
  return findOrCreateCart({
    userId: user?.id,
    sessionId,
    create,
  });
}

async function buildView(cartId: number | null): Promise<CartView> {
  if (!cartId) return { cartId: null, lines: [], itemCount: 0, subtotalCents: 0 };

  const rows = await db
    .select({
      itemId: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      compareAtPriceCents: products.compareAtPriceCents,
      stock: products.stock,
      status: products.status,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cartId))
    .all();

  // Hydrate first image for each
  const ids = rows.map((r) => r.productId);
  const imgMap = new Map<number, string>();
  if (ids.length > 0) {
    const imgs = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
      })
      .from(productImages)
      .where(sql`${productImages.productId} IN ${ids}`)
      .orderBy(asc(productImages.sortOrder))
      .all();
    for (const i of imgs) {
      if (!imgMap.has(i.productId)) imgMap.set(i.productId, i.url);
    }
  }

  const lines: CartLine[] = rows.map((r) => ({
    id: r.itemId,
    productId: r.productId,
    name: r.name,
    slug: r.slug,
    imageUrl: imgMap.get(r.productId) ?? null,
    unitPriceCents: r.priceCents,
    compareAtPriceCents: r.compareAtPriceCents,
    quantity: r.quantity,
    stock: r.stock,
    available: r.status === "active" && r.stock >= r.quantity,
    lineSubtotalCents: r.priceCents * r.quantity,
  }));

  return {
    cartId,
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotalCents: lines.reduce((s, l) => s + l.lineSubtotalCents, 0),
  };
}

export async function getCart(): Promise<CartView> {
  const cartId = await getOrCreateForRequest(false);
  return buildView(cartId);
}

export async function getCartItemCount(): Promise<number> {
  const v = await getCart();
  return v.itemCount;
}

export async function addItem(
  productId: number,
  quantity: number,
): Promise<CartView> {
  if (quantity < 1) throw errors.validation("Quantity must be at least 1");

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .get();
  if (!product || product.status !== "active") {
    throw errors.productInactive(product?.name ?? "Product");
  }

  const cartId = await getOrCreateForRequest(true);
  if (!cartId) throw errors.internal("Cart could not be created");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .get();

  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stock) {
    throw errors.stockUnavailable(product.name, product.stock);
  }

  if (existing) {
    await db
      .update(cartItems)
      .set({
        quantity: newQty,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db
      .insert(cartItems)
      .values({ cartId, productId, quantity: newQty });
  }

  return buildView(cartId);
}

export async function updateItemQuantity(
  itemId: number,
  quantity: number,
): Promise<CartView> {
  if (quantity < 1) throw errors.validation("Use remove instead of qty=0");

  const item = await db
    .select({
      itemId: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
    })
    .from(cartItems)
    .where(eq(cartItems.id, itemId))
    .get();
  if (!item) throw errors.notFound("Cart item not found");

  // Make sure the cart belongs to the requester
  const ownership = await getOrCreateForRequest(false);
  if (ownership !== item.cartId) throw errors.forbidden();

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, item.productId))
    .get();
  if (!product || product.status !== "active") {
    throw errors.productInactive(product?.name ?? "Product");
  }
  if (quantity > product.stock) {
    throw errors.stockUnavailable(product.name, product.stock);
  }

  await db
    .update(cartItems)
    .set({ quantity, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(cartItems.id, itemId));

  return buildView(item.cartId);
}

export async function removeItem(itemId: number): Promise<CartView> {
  const item = await db
    .select({ itemId: cartItems.id, cartId: cartItems.cartId })
    .from(cartItems)
    .where(eq(cartItems.id, itemId))
    .get();
  if (!item) throw errors.notFound("Cart item not found");

  const ownership = await getOrCreateForRequest(false);
  if (ownership !== item.cartId) throw errors.forbidden();

  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return buildView(item.cartId);
}

export async function clearCart(cartId: number) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

// Used after login: merge guest cart into the user's cart
export async function mergeGuestCartIntoUserCart(
  userId: number,
  sessionId: string,
) {
  const guestCart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .get();
  if (!guestCart) return;

  const userCartRow = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .get();

  let userCartId = userCartRow?.id;
  if (!userCartId) {
    const inserted = await db
      .insert(carts)
      .values({ userId })
      .returning({ id: carts.id });
    userCartId = inserted[0]!.id;
  }

  const guestItems = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, guestCart.id))
    .all();

  for (const gi of guestItems) {
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, userCartId),
          eq(cartItems.productId, gi.productId),
        ),
      )
      .get();
    const product = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, gi.productId))
      .get();
    const stock = product?.stock ?? 0;
    if (existing) {
      const merged = Math.min(existing.quantity + gi.quantity, stock);
      if (merged > 0) {
        await db
          .update(cartItems)
          .set({ quantity: merged, updatedAt: Math.floor(Date.now() / 1000) })
          .where(eq(cartItems.id, existing.id));
      }
    } else {
      const qty = Math.min(gi.quantity, stock);
      if (qty > 0) {
        await db
          .insert(cartItems)
          .values({ cartId: userCartId, productId: gi.productId, quantity: qty });
      }
    }
  }
  // Discard guest cart
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
