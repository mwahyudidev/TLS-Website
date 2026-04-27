import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, customers, roles } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { errors } from "@/server/lib/errors";
import {
  createSession,
  destroyCurrentSession,
  type AuthUser,
} from "@/server/lib/session";
import type { LoginInput, RegisterInput } from "./validators";

export async function register(input: RegisterInput): Promise<AuthUser> {
  // Check email uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .get();
  if (existing) {
    throw errors.conflict("An account with this email already exists");
  }

  const customerRole = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "customer"))
    .get();
  if (!customerRole) throw errors.internal("Customer role missing — run db:seed");

  const passwordHash = await hashPassword(input.password);

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        roleId: customerRole.id,
        status: "active",
      })
      .returning();

    await tx.insert(customers).values({
      userId: user!.id,
      name: user!.name,
      email: user!.email,
      phone: user!.phone,
    });

    return user!;
  });

  await createSession(created.id);

  return {
    id: created.id,
    email: created.email,
    name: created.name,
    phone: created.phone,
    role: "customer",
    status: "active",
  };
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const row = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      passwordHash: users.passwordHash,
      status: users.status,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(eq(users.email, input.email))
    .get();

  // Same generic error for "no user" and "wrong password" → no enumeration
  const generic = errors.unauthorized("Invalid email or password");
  if (!row) throw generic;
  if (row.status !== "active") throw errors.forbidden("Account disabled");

  const ok = await verifyPassword(row.passwordHash, input.password);
  if (!ok) throw generic;

  await createSession(row.id);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.roleName,
    status: row.status as "active" | "disabled",
  };
}

export async function logout(): Promise<void> {
  await destroyCurrentSession();
}
