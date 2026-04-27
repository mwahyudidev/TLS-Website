import "server-only";
import crypto from "crypto";

const BASE_URL =
  process.env.EASYPARCEL_API_URL ?? "https://app.easyparcel.com/api";
const API_KEY = process.env.EASYPARCEL_API_KEY ?? "";
const WEBHOOK_SECRET = process.env.EASYPARCEL_WEBHOOK_SECRET ?? "";

export const SENDER = {
  postcode: process.env.EASYPARCEL_ORIGIN_POSTCODE ?? "018989",
  name: process.env.EASYPARCEL_SENDER_NAME ?? "The Line Seafood",
  phone: process.env.EASYPARCEL_SENDER_PHONE ?? "+6591234567",
  email: process.env.EASYPARCEL_SENDER_EMAIL ?? "orders@ths.sg",
  address: process.env.EASYPARCEL_SENDER_ADDRESS ?? "Singapore",
};

export function isEasyParcelConfigured(): boolean {
  return Boolean(API_KEY);
}

// ---------- Public types ----------

export type EPRate = {
  serviceId: string;
  serviceName: string;
  courierId: string;
  courierName: string;
  priceCents: number;
  estimatedDelivery: string;
};

export type EPShipmentResult = {
  shipmentId: string;
  trackingNumber: string;
  labelUrl: string;
  courierName: string;
  serviceName: string;
  priceCents: number;
  raw: Record<string, unknown>;
};

export type EPTrackingEvent = {
  status: string;
  description: string;
  timestamp: number;
};

// ---------- Internal helpers ----------

async function epPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "EzAPI-Key": API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `EasyParcel API ${endpoint} error: ${res.status} – ${text}`,
    );
  }
  return res.json() as Promise<T>;
}

// ---------- Rate check ----------

export async function getShippingRates(params: {
  deliverPostcode: string;
  deliverCountry?: string;
  weightKg: number;
  itemValueCents: number;
}): Promise<EPRate[]> {
  type Raw = {
    service_id: string;
    service_name: string;
    courier_id: string;
    courier_name: string;
    price: number | string;
    est_delivery: string;
  };
  type Res = { status?: number; results?: Raw[] };

  const res = await epPost<Res>("/rate_list", {
    pick_up_postcode: SENDER.postcode,
    pick_up_country: "SG",
    deliver_postcode: params.deliverPostcode,
    deliver_country: params.deliverCountry ?? "SG",
    item_weight: params.weightKg,
    item_value: (params.itemValueCents / 100).toFixed(2),
    courier_type: "domestic",
    country: "SG",
  });

  if (!res.results?.length) return [];

  return res.results.map((r) => ({
    serviceId: r.service_id,
    serviceName: r.service_name,
    courierId: r.courier_id,
    courierName: r.courier_name,
    priceCents: Math.round(Number(r.price) * 100),
    estimatedDelivery: r.est_delivery ?? "",
  }));
}

// ---------- Create shipment ----------

export async function createShipment(params: {
  serviceId: string;
  courierId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientPostcode: string;
  recipientCountry?: string;
  weightKg: number;
  itemName: string;
  itemValueCents: number;
  orderNumber: string;
}): Promise<EPShipmentResult> {
  type RawResult = {
    shipment_id?: string;
    tracking_number?: string;
    label_url?: string;
    courier_name?: string;
    service_name?: string;
    rate?: number | string;
  };
  type Res = { status?: number; results?: RawResult[] } & RawResult;

  const raw = await epPost<Res>("/order/submit", {
    service_id: params.serviceId,
    courier_id: params.courierId,
    pick_up_name: SENDER.name,
    pick_up_contact: SENDER.phone,
    pick_up_email: SENDER.email,
    pick_up_address: SENDER.address,
    pick_up_postcode: SENDER.postcode,
    pick_up_country: "SG",
    deliver_name: params.recipientName,
    deliver_contact: params.recipientPhone,
    deliver_email: params.recipientEmail,
    deliver_address: params.recipientAddress,
    deliver_postcode: params.recipientPostcode,
    deliver_country: params.recipientCountry ?? "SG",
    item_weight: params.weightKg,
    item_name: params.itemName,
    item_value: (params.itemValueCents / 100).toFixed(2),
    order_number: params.orderNumber,
  });

  const r = raw.results?.[0] ?? raw;
  if (!r.shipment_id) {
    throw new Error(
      "EasyParcel createShipment: no shipment_id in response – " +
        JSON.stringify(raw),
    );
  }

  return {
    shipmentId: r.shipment_id,
    trackingNumber: r.tracking_number ?? "",
    labelUrl: r.label_url ?? "",
    courierName: r.courier_name ?? params.courierId,
    serviceName: r.service_name ?? params.serviceId,
    priceCents: Math.round(Number(r.rate ?? 0) * 100),
    raw: raw as Record<string, unknown>,
  };
}

// ---------- Tracking ----------

export async function getShipmentTracking(
  trackingNumber: string,
): Promise<EPTrackingEvent[]> {
  type RawEvent = {
    status?: string;
    description?: string;
    updated_at?: string;
  };
  type Res = { status?: number; results?: RawEvent[] };

  const res = await epPost<Res>("/tracking_detail", {
    tracking_number: trackingNumber,
    country: "SG",
  });

  if (!res.results?.length) return [];

  return res.results.map((r) => ({
    status: r.status ?? "",
    description: r.description ?? "",
    timestamp: r.updated_at
      ? Math.floor(new Date(r.updated_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000),
  }));
}

// ---------- Webhook signature verification ----------

export function verifyEasyParcelWebhook(
  rawBody: string,
  signature: string,
): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}
