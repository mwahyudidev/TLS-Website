import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";

// We test the order lifecycle end-to-end against a fresh on-disk SQLite DB.
// The test DB lives in a temp dir and is reset for the test run.

const TEST_DB = path.resolve(__dirname, "../../db/data/_test_lifecycle.db");

beforeAll(async () => {
  // Wipe and rebuild
  for (const ext of ["", "-journal", "-wal", "-shm"]) {
    const p = TEST_DB + ext;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  process.env.TURSO_DATABASE_URL = `file:${TEST_DB}`;
  process.env.TURSO_AUTH_TOKEN = "";

  const client = createClient({ url: `file:${TEST_DB}` });
  const d = drizzle(client);
  await migrate(d, {
    migrationsFolder: path.resolve(__dirname, "../../db/migrations"),
  });
  await client.close();
});

describe("order lifecycle", () => {
  it("creates schema and runs the canonical 9-step lifecycle", async () => {
    // Dynamically import after env is set so that db/client picks up TEST_DB.
    const { db } = await import("@/db/client");
    const schema = await import("@/db/schema");

    // Seed minimal data: roles, admin user, product
    const [customerRole] = await db
      .insert(schema.roles)
      .values({ name: "customer" })
      .returning();
    const [adminRole] = await db
      .insert(schema.roles)
      .values({ name: "super_admin" })
      .returning();
    const [admin] = await db
      .insert(schema.users)
      .values({
        email: "admin@test",
        passwordHash: "x",
        name: "Admin",
        roleId: adminRole!.id,
        status: "active",
      })
      .returning();
    expect(customerRole).toBeTruthy();
    expect(admin).toBeTruthy();

    const [product] = await db
      .insert(schema.products)
      .values({
        name: "Test Tee",
        slug: "test-tee",
        priceCents: 5000,
        stock: 5,
        sku: "TST-001",
        weightGrams: 100,
        status: "active",
        featured: false,
      })
      .returning();

    // Insert an order directly with all 3 history rows (mirror checkout service)
    const [order] = await db
      .insert(schema.orders)
      .values({
        orderNumber: "TST-2026-000001",
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerPhone: "+65 9000 0000",
        subtotalCents: 10000,
        shippingTotalCents: 500,
        grandTotalCents: 10500,
        currency: "SGD",
        orderStatus: "pending",
        paymentStatus: "unpaid",
      })
      .returning();

    await db.insert(schema.orderItems).values({
      orderId: order!.id,
      productId: product!.id,
      productName: product!.name,
      productSku: product!.sku,
      unitPriceCents: product!.priceCents,
      quantity: 2,
      lineSubtotalCents: 10000,
    });

    await db.insert(schema.payments).values({
      orderId: order!.id,
      paymentMethod: "Manual (sim)",
      paymentProvider: "manual_simulation",
      paymentStatus: "unpaid",
      transactionReference: "REF-1",
      amountCents: 10500,
    });

    await db.insert(schema.shipments).values({
      orderId: order!.id,
      shippingStatus: "not_shipped",
      shippingCostCents: 500,
    });

    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.orderId, order!.id));
    const [shipment] = await db
      .select()
      .from(schema.shipments)
      .where(eq(schema.shipments.orderId, order!.id));

    // Mark paid via the service
    const adminUser = {
      id: admin!.id,
      email: admin!.email,
      name: admin!.name,
      phone: null,
      role: "super_admin",
      status: "active" as const,
    };
    const { markPaid, refundSimulation } = await import(
      "@/server/modules/payments/service"
    );
    await markPaid(payment!.id, { by: adminUser });

    // Stock should now be 5 - 2 = 3
    const [afterPaid] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, product!.id));
    expect(afterPaid!.stock).toBe(3);

    const [orderAfterPaid] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, order!.id));
    expect(orderAfterPaid!.paymentStatus).toBe("paid");
    expect(orderAfterPaid!.orderStatus).toBe("processing");

    // Idempotency: marking again should throw
    await expect(markPaid(payment!.id, { by: adminUser })).rejects.toThrow();

    // Stock unchanged
    const [afterSecondAttempt] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, product!.id));
    expect(afterSecondAttempt!.stock).toBe(3);

    // Walk shipment forward
    const { setShipmentStatus } = await import(
      "@/server/modules/shipments/service"
    );
    await setShipmentStatus(shipment!.id, "shipped", { by: adminUser });
    await setShipmentStatus(shipment!.id, "in_transit", { by: adminUser });
    await setShipmentStatus(shipment!.id, "delivered", { by: adminUser });

    const [orderAfterDelivered] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, order!.id));
    expect(orderAfterDelivered!.orderStatus).toBe("delivered");

    // Refund: stock should be restored
    await refundSimulation(payment!.id, { by: adminUser });
    const [afterRefund] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, product!.id));
    expect(afterRefund!.stock).toBe(5); // 3 + 2 restocked

    const [orderAfterRefund] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, order!.id));
    expect(orderAfterRefund!.paymentStatus).toBe("refunded");
    expect(orderAfterRefund!.orderStatus).toBe("refunded");

    // History should contain a comprehensive timeline
    const history = await db
      .select()
      .from(schema.orderStatusHistory)
      .where(eq(schema.orderStatusHistory.orderId, order!.id));
    const titles = history.map((h) => h.title);
    expect(titles).toContain("Payment confirmed");
    expect(titles).toContain("Refund issued (simulation)");
    expect(titles).toContain("Shipped");
    expect(titles).toContain("Delivered");
  });
});
