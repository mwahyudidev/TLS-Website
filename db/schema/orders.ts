import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { timestamp, nullableTimestamp } from "./_helpers";
import { customers } from "./customers";
import { products } from "./products";
import { users } from "./users";

// Status enums (kept as text for forward compatibility / readable DB rows)
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SHIPPING_STATUSES = [
  "not_shipped",
  "preparing",
  "packed",
  "shipped",
  "in_transit",
  "delivered",
  "failed",
  "returned",
] as const;
export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];

export const PAYMENT_PROVIDERS = [
  "manual_simulation",
  "bank_transfer_simulation",
  "cod_simulation",
  "ewallet_simulation_placeholder",
] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderNumber: text("order_number").notNull().unique(),
    customerId: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountTotalCents: integer("discount_total_cents").notNull().default(0),
    shippingTotalCents: integer("shipping_total_cents").notNull().default(0),
    grandTotalCents: integer("grand_total_cents").notNull(),
    currency: text("currency").notNull().default("SGD"),
    couponCode: text("coupon_code"),
    orderStatus: text("order_status", { enum: ORDER_STATUSES })
      .notNull()
      .default("pending"),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES })
      .notNull()
      .default("unpaid"),
    notes: text("notes"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    emailIdx: index("orders_email_idx").on(t.customerEmail),
    statusIdx: index("orders_status_idx").on(t.orderStatus),
    paymentIdx: index("orders_payment_status_idx").on(t.paymentStatus),
    createdIdx: index("orders_created_idx").on(t.createdAt),
    customerIdx: index("orders_customer_idx").on(t.customerId),
  }),
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    productSku: text("product_sku").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineSubtotalCents: integer("line_subtotal_cents").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
    qtyPos: check("order_items_qty_positive", sql`${t.quantity} > 0`),
  }),
);

export const shippingAddresses = sqliteTable(
  "shipping_addresses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone"),
    addressLine: text("address_line").notNull(),
    addressLine2: text("address_line2"),
    city: text("city").notNull(),
    province: text("province"),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("Singapore"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    orderUq: uniqueIndex("shipping_addresses_order_uq").on(t.orderId),
  }),
);

export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    paymentMethod: text("payment_method").notNull(), // human-readable
    paymentProvider: text("payment_provider", { enum: PAYMENT_PROVIDERS }).notNull(),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES })
      .notNull()
      .default("unpaid"),
    transactionReference: text("transaction_reference").notNull(),
    amountCents: integer("amount_cents").notNull(),
    paidAt: nullableTimestamp("paid_at"),
    failedAt: nullableTimestamp("failed_at"),
    cancelledAt: nullableTimestamp("cancelled_at"),
    refundedAt: nullableTimestamp("refunded_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    orderIdx: index("payments_order_idx").on(t.orderId),
    statusIdx: index("payments_status_idx").on(t.paymentStatus),
  }),
);

export const shipments = sqliteTable(
  "shipments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    courierName: text("courier_name"),
    shippingService: text("shipping_service"),
    trackingNumber: text("tracking_number"),
    shippingCostCents: integer("shipping_cost_cents").notNull().default(0),
    estimatedDelivery: nullableTimestamp("estimated_delivery"),
    shippingStatus: text("shipping_status", { enum: SHIPPING_STATUSES })
      .notNull()
      .default("not_shipped"),
    shippedAt: nullableTimestamp("shipped_at"),
    deliveredAt: nullableTimestamp("delivered_at"),
    notes: text("notes"),
    // EasyParcel-specific fields (null when using flat-rate fallback)
    easyParcelServiceId: text("easy_parcel_service_id"),
    easyParcelCourierId: text("easy_parcel_courier_id"),
    easyParcelShipmentId: text("easy_parcel_shipment_id"),
    labelUrl: text("label_url"),
    easyParcelRaw: text("easy_parcel_raw"), // JSON blob
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    orderUq: uniqueIndex("shipments_order_uq").on(t.orderId),
    statusIdx: index("shipments_status_idx").on(t.shippingStatus),
  }),
);

// audit log driving the customer tracking timeline
export const STATUS_HISTORY_TYPES = ["order", "payment", "shipping"] as const;
export type StatusHistoryType = (typeof STATUS_HISTORY_TYPES)[number];

export const orderStatusHistory = sqliteTable(
  "order_status_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    statusType: text("status_type", { enum: STATUS_HISTORY_TYPES }).notNull(),
    oldStatus: text("old_status"),
    newStatus: text("new_status").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    changedByUserId: integer("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    changedByRole: text("changed_by_role"),
    createdAt: timestamp("created_at"),
  },
  (t) => ({
    orderIdx: index("order_status_history_order_idx").on(t.orderId, t.createdAt),
    typeIdx: index("order_status_history_type_idx").on(t.statusType),
  }),
);

// Counter for sequential order numbers (avoids race conditions)
export const orderNumberSeq = sqliteTable("order_number_seq", {
  id: integer("id").primaryKey().default(1),
  year: integer("year").notNull(),
  lastNumber: integer("last_number").notNull().default(0),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
