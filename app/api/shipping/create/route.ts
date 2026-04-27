import { z } from "zod";
import { eq } from "drizzle-orm";
import { ok, fail, parseJson } from "@/server/lib/api";
import { createShipment, isEasyParcelConfigured } from "@/lib/easyparcel";
import { db } from "@/db/client";
import {
  orders,
  shipments,
  shippingAddresses,
  orderItems,
  orderStatusHistory,
} from "@/db/schema";
import { requireAdmin } from "@/server/lib/session";

const schema = z.object({
  orderId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();

    if (!isEasyParcelConfigured()) {
      return fail(
        Object.assign(new Error("EasyParcel is not configured"), {
          status: 503,
          code: "ep_not_configured",
        }),
      );
    }

    const { orderId } = await parseJson(req, schema);

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();
    if (!order) throw new Error("Order not found");

    const shipment = await db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId))
      .get();
    if (!shipment) throw new Error("Shipment record not found");
    if (shipment.easyParcelShipmentId) {
      return ok({
        alreadyCreated: true,
        shipmentId: shipment.easyParcelShipmentId,
        trackingNumber: shipment.trackingNumber,
      });
    }
    if (!shipment.easyParcelServiceId || !shipment.easyParcelCourierId) {
      throw new Error(
        "No EasyParcel service selected for this order (customer chose flat-rate or no rate was selected)",
      );
    }

    const address = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.orderId, orderId))
      .get();
    if (!address) throw new Error("Shipping address not found");

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .all();
    const itemName = items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");

    const result = await createShipment({
      serviceId: shipment.easyParcelServiceId,
      courierId: shipment.easyParcelCourierId,
      recipientName: address.recipientName,
      recipientPhone: address.phone ?? order.customerPhone ?? "",
      recipientEmail: order.customerEmail,
      recipientAddress: [address.addressLine, address.addressLine2]
        .filter(Boolean)
        .join(", "),
      recipientPostcode: address.postalCode,
      recipientCountry: address.country === "Singapore" ? "SG" : address.country,
      weightKg: Math.max(0.1, order.subtotalCents / 10000), // rough estimate
      itemName,
      itemValueCents: order.subtotalCents,
      orderNumber: order.orderNumber,
    });

    const nowSec = Math.floor(Date.now() / 1000);
    await db
      .update(shipments)
      .set({
        easyParcelShipmentId: result.shipmentId,
        trackingNumber: result.trackingNumber || shipment.trackingNumber,
        labelUrl: result.labelUrl,
        courierName: result.courierName,
        shippingService: result.serviceName,
        easyParcelRaw: JSON.stringify(result.raw),
        shippingStatus: "preparing",
        updatedAt: nowSec,
      })
      .where(eq(shipments.id, shipment.id));

    await db.insert(orderStatusHistory).values({
      orderId,
      statusType: "shipping",
      oldStatus: shipment.shippingStatus,
      newStatus: "preparing",
      title: "Shipment created via EasyParcel",
      description: `${result.courierName} – ${result.serviceName} | Tracking: ${result.trackingNumber}`,
      changedByRole: "admin",
      createdAt: nowSec,
    });

    return ok({
      alreadyCreated: false,
      shipmentId: result.shipmentId,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      courierName: result.courierName,
    });
  } catch (e) {
    return fail(e);
  }
}
