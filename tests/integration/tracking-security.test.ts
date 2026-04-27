import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const TEST_DB = path.resolve(__dirname, "../../db/data/_test_tracking.db");

beforeAll(() => {
  for (const ext of ["", "-journal", "-wal", "-shm"]) {
    const p = TEST_DB + ext;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  process.env.DATABASE_URL = TEST_DB;
  const sqlite = new Database(TEST_DB);
  sqlite.pragma("foreign_keys = ON");
  migrate(drizzle(sqlite), {
    migrationsFolder: path.resolve(__dirname, "../../db/migrations"),
  });
  sqlite.close();
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
