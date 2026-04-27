import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { sendOrderShipped } from "@/server/lib/email";
import {
  shipments,
  orders,
  orderStatusHistory,
  type ShippingStatus,
  type OrderStatus,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { assertShippingTransition } from "@/server/statusMachine/shippingStatus";
import { assertOrderTransition } from "@/server/statusMachine/orderStatus";
import type { AuthUser } from "@/server/lib/session";

export const shipmentInputSchema = z.object({
  courierName: z.string().min(1).max(100).trim().optional(),
  shippingService: z.string().min(1).max(100).trim().optional(),
  trackingNumber: z.string().min(1).max(100).trim().optional(),
  shippingCostCents: z.number().int().min(0).optional(),
  estimatedDeliveryUnix: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(500).optional(),
});
export type ShipmentInput = z.infer<typeof shipmentInputSchema>;

async function loadShipmentByOrder(orderId: number) {
  return db.select().from(shipments).where(eq(shipments.orderId, orderId)).get();
}

export async function getOrCreateShipment(orderId: number) {
  const existing = await loadShipmentByOrder(orderId);
  if (existing) return existing;

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw errors.notFound("Order not found");

  const inserted = await db
    .insert(shipments)
    .values({ orderId, shippingStatus: "not_shipped" })
    .returning();
  return inserted[0]!;
}

export async function updateShipmentDetails(
  shipmentId: number,
  input: ShipmentInput,
  ctx: { by: AuthUser },
) {
  const ship = await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, shipmentId))
    .get();
  if (!ship) throw errors.notFound("Shipment not found");

  const nowSec = Math.floor(Date.now() / 1000);
  const patch: Record<string, unknown> = { updatedAt: nowSec };
  if (input.courierName !== undefined) patch.courierName = input.courierName;
  if (input.shippingService !== undefined) patch.shippingService = input.shippingService;
  if (input.trackingNumber !== undefined) patch.trackingNumber = input.trackingNumber;
  if (input.shippingCostCents !== undefined)
    patch.shippingCostCents = input.shippingCostCents;
  if (input.estimatedDeliveryUnix !== undefined)
    patch.estimatedDelivery = input.estimatedDeliveryUnix;
  if (input.notes !== undefined) patch.notes = input.notes;

  await db.update(shipments).set(patch).where(eq(shipments.id, shipmentId));

  // If we just received tracking info but haven't recorded a history note, log it.
  if (
    input.trackingNumber &&
    input.trackingNumber !== ship.trackingNumber
  ) {
    await db.insert(orderStatusHistory).values({
      orderId: ship.orderId,
      statusType: "shipping",
      oldStatus: ship.shippingStatus,
      newStatus: ship.shippingStatus,
      title: "Tracking number added",
      description: `Tracking #${input.trackingNumber} via ${
        input.courierName ?? ship.courierName ?? "courier"
      }`,
      changedByUserId: ctx.by.id,
      changedByRole: ctx.by.role,
      createdAt: nowSec,
    });
  }

  return { ok: true };
}

export async function setShipmentStatus(
  shipmentId: number,
  newStatus: ShippingStatus,
  ctx: { by: AuthUser; notes?: string },
) {
  const ship = await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, shipmentId))
    .get();
  if (!ship) throw errors.notFound("Shipment not found");
  assertShippingTransition(ship.shippingStatus, newStatus);

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, ship.orderId))
    .get();
  if (!order) throw errors.notFound("Order not found");

  const nowSec = Math.floor(Date.now() / 1000);

  // Map shipping status -> implied order status changes
  let nextOrderStatus: OrderStatus | null = null;
  if (newStatus === "shipped" && order.orderStatus !== "shipped") {
    nextOrderStatus = "shipped";
  } else if (newStatus === "delivered" && order.orderStatus !== "delivered") {
    nextOrderStatus = "delivered";
  }
  if (nextOrderStatus) assertOrderTransition(order.orderStatus, nextOrderStatus);

  await db.transaction(async (tx) => {
    const patch: Record<string, unknown> = {
      shippingStatus: newStatus,
      notes: ctx.notes ?? ship.notes,
      updatedAt: nowSec,
    };
    if (newStatus === "shipped" && !ship.shippedAt) patch.shippedAt = nowSec;
    if (newStatus === "delivered" && !ship.deliveredAt) patch.deliveredAt = nowSec;

    await tx.update(shipments).set(patch).where(eq(shipments.id, shipmentId));

    await tx.insert(orderStatusHistory).values({
      orderId: ship.orderId,
      statusType: "shipping",
      oldStatus: ship.shippingStatus,
      newStatus,
      title: shippingStatusTitle(newStatus),
      description: ctx.notes ?? `Updated by ${ctx.by.name}`,
      changedByUserId: ctx.by.id,
      changedByRole: ctx.by.role,
      createdAt: nowSec,
    });

    if (nextOrderStatus) {
      await tx
        .update(orders)
        .set({ orderStatus: nextOrderStatus, updatedAt: nowSec })
        .where(eq(orders.id, order.id));

      await tx.insert(orderStatusHistory).values({
        orderId: ship.orderId,
        statusType: "order",
        oldStatus: order.orderStatus,
        newStatus: nextOrderStatus,
        title: orderStatusTitle(nextOrderStatus),
        description: `Auto-updated from shipping status`,
        changedByUserId: ctx.by.id,
        changedByRole: ctx.by.role,
        createdAt: nowSec,
      });
    }
  });

  if (newStatus === "shipped") {
    const order = await db.select().from(orders).where(eq(orders.id, ship.orderId)).get();
    if (order) {
      void sendOrderShipped(order.customerEmail, {
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        courierName: ship.courierName,
        trackingNumber: ship.trackingNumber,
        estimatedDelivery: ship.estimatedDelivery,
      });
    }
  }

  return { ok: true };
}

export async function updateEasyParcelDetails(
  shipmentId: number,
  ep: {
    easyParcelShipmentId: string;
    trackingNumber: string;
    labelUrl: string;
    courierName: string;
    serviceName: string;
    priceCents: number;
    raw: Record<string, unknown>;
  },
) {
  const nowSec = Math.floor(Date.now() / 1000);
  await db
    .update(shipments)
    .set({
      easyParcelShipmentId: ep.easyParcelShipmentId,
      trackingNumber: ep.trackingNumber || undefined,
      labelUrl: ep.labelUrl || undefined,
      courierName: ep.courierName,
      shippingService: ep.serviceName,
      shippingCostCents: ep.priceCents,
      easyParcelRaw: JSON.stringify(ep.raw),
      shippingStatus: "preparing",
      updatedAt: nowSec,
    })
    .where(eq(shipments.id, shipmentId));
  return { ok: true };
}

function shippingStatusTitle(s: ShippingStatus): string {
  return {
    not_shipped: "Not shipped",
    preparing: "Preparing for shipment",
    packed: "Packed",
    shipped: "Shipped",
    in_transit: "In transit",
    delivered: "Delivered",
    failed: "Shipping failed",
    returned: "Returned",
  }[s];
}

function orderStatusTitle(s: OrderStatus): string {
  return {
    pending: "Order pending",
    processing: "Order processing",
    packed: "Order packed",
    shipped: "Order shipped",
    delivered: "Order delivered",
    completed: "Order completed",
    cancelled: "Order cancelled",
    refunded: "Order refunded",
  }[s];
}
