import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const TEST_DB = path.resolve(__dirname, "../../db/data/_test_tracking.db");

beforeAll(async () => {
  for (const ext of ["", "-journal", "-wal", "-shm"]) {
    const p = TEST_DB + ext;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  process.env.TURSO_DATABASE_URL = `file:${TEST_DB}`;
  process.env.TURSO_AUTH_TOKEN = "";

  const client = createClient({ url: `file:${TEST_DB}` });
  await migrate(drizzle(client), {
    migrationsFolder: path.resolve(__dirname, "../../db/migrations"),
  });
  await client.close();
});

describe("tracking security", () => {
  it("rejects requests where email does not match the order's", async () => {
    const { db } = await import("@/db/client");
    const schema = await import("@/db/schema");
    const { getTrackingPayload } = await import(
      "@/server/modules/tracking/service"
    );

    await db.insert(schema.orders).values({
      orderNumber: "SEC-2026-000001",
      customerName: "Owner",
      customerEmail: "owner@example.com",
      subtotalCents: 1000,
      grandTotalCents: 1000,
      orderStatus: "pending",
      paymentStatus: "unpaid",
    });

    // Right email succeeds
    const ok = await getTrackingPayload(
      "SEC-2026-000001",
      "owner@example.com",
    );
    expect(ok.orderNumber).toBe("SEC-2026-000001");

    // Wrong email fails with NOT_FOUND (not e.g. "wrong email")
    await expect(
      getTrackingPayload("SEC-2026-000001", "attacker@example.com"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    // Non-existent order also fails with the same NOT_FOUND
    await expect(
      getTrackingPayload("DOES-NOT-EXIST", "anyone@example.com"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    // Email match is case-insensitive and trim-tolerant
    const ok2 = await getTrackingPayload(
      "SEC-2026-000001",
      "  Owner@Example.COM  ",
    );
    expect(ok2.orderNumber).toBe("SEC-2026-000001");
  });
});
