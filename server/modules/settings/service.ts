import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";

let cache: Record<string, unknown> | null = null;
let cacheBuiltAt = 0;
const TTL_MS = 30_000;

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const now = Date.now();
  if (cache && now - cacheBuiltAt < TTL_MS) return cache;

  const rows = await db.select().from(storeSettings).all();
  const map: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      map[r.key] = JSON.parse(r.value);
    } catch {
      map[r.key] = r.value;
    }
  }
  cache = map;
  cacheBuiltAt = now;
  return map;
}

export async function getSetting<T = unknown>(
  key: string,
  fallback?: T,
): Promise<T | undefined> {
  const all = await getAllSettings();
  return (all[key] as T) ?? fallback;
}

export async function setSetting(key: string, value: unknown) {
  const json = JSON.stringify(value);
  const existing = await db
    .select({ id: storeSettings.id })
    .from(storeSettings)
    .where(eq(storeSettings.key, key))
    .get();
  if (existing) {
    await db
      .update(storeSettings)
      .set({ value: json, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(storeSettings.key, key));
  } else {
    await db.insert(storeSettings).values({ key, value: json });
  }
  cache = null;
}

export async function setSettings(
  entries: Array<{ key: string; value?: unknown }>,
) {
  for (const { key, value } of entries) {
    await setSetting(key, value);
  }
  cache = null;
}

// Convenience typed accessors
export async function getStoreInfo() {
  const all = await getAllSettings();
  return {
    name: (all["store.name"] as string) ?? "The Line Seafood",
    tagline: (all["store.tagline"] as string) ?? "",
    email: (all["store.email"] as string) ?? "",
    phone: (all["store.phone"] as string) ?? "",
    address: (all["store.address"] as string) ?? "",
    currency: (all["store.currency"] as string) ?? "SGD",
  };
}

export async function getShippingConfig() {
  const all = await getAllSettings();
  return {
    flatRateCents: Number(all["shipping.flat_rate_cents"] ?? 500),
    freeThresholdCents: Number(all["shipping.free_threshold_cents"] ?? 10000),
  };
}

export async function getLowStockThreshold() {
  const all = await getAllSettings();
  return Number(all["stock.low_threshold"] ?? 10);
}
