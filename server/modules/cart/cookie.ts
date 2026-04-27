import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

const COOKIE_NAME = process.env.CART_COOKIE_NAME ?? "tls_cart";
const TTL_DAYS = Number(process.env.CART_TTL_DAYS ?? "30");
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

export async function getCartSessionId(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

export async function getOrCreateCartSessionId(): Promise<string> {
  const c = await cookies();
  const existing = c.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  const id = randomBytes(24).toString("base64url");
  c.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
  return id;
}

export async function clearCartCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
