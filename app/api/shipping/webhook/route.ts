import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyEasyParcelWebhook } from "@/lib/easyparcel";
import { db } from "@/db/client";
import { shipments, orderStatusHistory } from "@/db/schema";
import type { ShippingStatus } from "@/db/schema";

// EasyParcel webhook — receives tracking status updates.
// Verify the signature when EASYPARCEL_WEBHOOK_SECRET is configured.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-ep-signature") ?? "";

  // Reject if secret is configured but signature is missing/invalid
  if (process.env.EASYPARCEL_WEBHOOK_SECRET) {
    if (!verifyEasyParcelWebhook(rawBody, signature)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // EP webhook shape (v3):
  // { shipment_id, tracking_number, status, description, updated_at }
  const epShipmentId = String(payload.shipment_id ?? "");
  const epStatus = String(payload.status ?? "").toLowerCase();
  const description = String(payload.description ?? "");

  if (!epShipmentId) {
    return NextResponse.json({ error: "missing_shipment_id" }, { status: 400 });
  }

  const shipment = await db
    .select()
    .from(shipments)
    .where(eq(shipments.easyParcelShipmentId, epShipmentId))
    .get();

  if (!shipment) {
    // Not an order we know about — acknowledge anyway (idempotent)
    return NextResponse.json({ ok: true, matched: false });
  }

  const newStatus = mapEPStatus(epStatus, shipment.shippingStatus);
  if (newStatus === shipment.shippingStatus) {
    return NextResponse.json({ ok: true, changed: false });
  }

  const nowSec = Math.floor(Date.now() / 1000);
  await db
    .update(shipments)
    .set({
      shippingStatus: newStatus,
      ...(newStatus === "shipped" && !shipment.shippedAt
        ? { shippedAt: nowSec }
        : {}),
      ...(newStatus === "delivered" && !shipment.deliveredAt
        ? { deliveredAt: nowSec }
        : {}),
      updatedAt: nowSec,
    })
    .where(eq(shipments.id, shipment.id));

  await db.insert(orderStatusHistory).values({
    orderId: shipment.orderId,
    statusType: "shipping",
    oldStatus: shipment.shippingStatus,
    newStatus,
    title: statusTitle(newStatus),
    description: description || `EasyParcel status: ${epStatus}`,
    changedByRole: "system",
    createdAt: nowSec,
  });

  return NextResponse.json({ ok: true, changed: true, newStatus });
}

function mapEPStatus(epStatus: string, current: ShippingStatus): ShippingStatus {
  if (epStatus.includes("deliver") || epStatus === "delivered") return "delivered";
  if (epStatus.includes("transit") || epStatus === "in_transit") return "in_transit";
  if (epStatus === "shipped" || epStatus.includes("pick")) return "shipped";
  if (epStatus === "failed" || epStatus.includes("fail")) return "failed";
  if (epStatus === "returned" || epStatus.includes("return")) return "returned";
  return current; // unknown status — keep unchanged
}

function statusTitle(s: ShippingStatus): string {
  return (
    {
      not_shipped: "Not shipped",
      preparing: "Preparing for shipment",
      packed: "Packed",
      shipped: "Shipped",
      in_transit: "In transit",
      delivered: "Delivered",
      failed: "Shipping failed",
      returned: "Returned",
    }[s] ?? s
  );
}
