import "server-only";
import { cookies } from "next/headers";
import { eq, lt, and } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { sessions, users, roles } from "@/db/schema";
import { errors } from "./errors";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "tls_session";
const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? "30");
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string; // role name
  status: "active" | "disabled";
};

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
  return token;
}

export async function destroyCurrentSession(): Promise<void> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  c.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      uid: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      status: users.status,
      roleName: roles.name,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(eq(sessions.id, token))
    .get();

  if (!row) return null;
  if (row.expiresAt < now) {
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }
  if (row.status !== "active") return null;

  return {
    id: row.uid,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.roleName,
    status: row.status,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw errors.unauthorized();
  return user;
}

export async function requireRole(allowed: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowed.includes(user.role)) throw errors.forbidden();
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(["super_admin", "admin", "staff"]);
}

// Periodic cleanup helper (call from a cron later)
export async function cleanupExpiredSessions() {
  const now = Math.floor(Date.now() / 1000);
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}
