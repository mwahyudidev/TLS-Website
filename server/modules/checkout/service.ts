import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  orders,
  orderItems,
  payments,
  shipments,
  shippingAddresses,
  orderStatusHistory,
  products,
  customers,
  cartItems,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { nextOrderNumber } from "@/server/lib/orderNumber";
import { getCurrentUser } from "@/server/lib/session";
import { getShippingConfig } from "@/server/modules/settings/service";
import { applyCoupon, recordCouponUse } from "@/server/modules/coupons/service";
import { getCart } from "@/server/modules/cart/service";
import { getPaymentProvider } from "@/server/providers/payment/registry";
import type { CheckoutInput } from "./validators";

export type PreviewResult = {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  grandTotalCents: number;
  appliedCoupon: { code: string; description: string } | null;
  freeShippingApplied: boolean;
};

export async function previewCheckout(input: {
  couponCode?: string;
}): Promise<PreviewResult> {
  const cart = await getCart();
  const subtotal = cart.subtotalCents;
  const shipping = await getShippingConfig();
  const freeShipping = subtotal >= shipping.freeThresholdCents;
  const shippingCents =
    freeShipping || cart.lines.length === 0 ? 0 : shipping.flatRateCents;

  let discountCents = 0;
  let appliedCoupon: { code: string; description: string } | null = null;
  if (input.couponCode) {
    const ac = await applyCoupon(input.couponCode, subtotal);
    discountCents = ac.discountCents;
    appliedCoupon = { code: ac.code, description: ac.description };
  }

  const grand = Math.max(0, subtotal - discountCents) + shippingCents;
  return {
    subtotalCents: subtotal,
    shippingCents,
    discountCents,
    grandTotalCents: grand,
    appliedCoupon,
    freeShippingApplied: freeShipping,
  };
}

export async function createOrder(input: CheckoutInput) {
  const user = await getCurrentUser();
  const cart = await getCart();
  if (cart.lines.length === 0) {
    throw errors.validation("Your cart is empty");
  }

  // Re-validate every line against the database (price, status, stock)
  // We also collect the authoritative SKU for snapshotting.
  type ValidatedLine = {
    productId: number;
    name: string;
    sku: string;
    unitPriceCents: number;
    quantity: number;
    lineSubtotalCents: number;
  };
  const validated: ValidatedLine[] = [];
  for (const line of cart.lines) {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, line.productId))
      .get();
    if (!product || product.status !== "active") {
      throw errors.productInactive(line.name);
    }
    if (product.stock < line.quantity) {
      throw errors.stockUnavailable(product.name, product.stock);
    }
    validated.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPriceCents: product.priceCents, // SOURCE OF TRUTH
      quantity: line.quantity,
      lineSubtotalCents: product.priceCents * line.quantity,
    });
  }

  // Recompute subtotal from validated server-side prices
  const subtotal = validated.reduce((s, l) => s + l.lineSubtotalCents, 0);
  const shipping = await getShippingConfig();
  const freeShipping = subtotal >= shipping.freeThresholdCents;

  // Shipping cost: free threshold beats everything; otherwise use EP-selected
  // rate if provided, otherwise store flat-rate.
  let shippingCents = freeShipping ? 0 : shipping.flatRateCents;
  if (!freeShipping && input.selectedShipping) {
    shippingCents = input.selectedShipping.priceCents;
  }

  let discountCents = 0;
  let appliedCouponCode: string | null = null;
  if (input.couponCode) {
    const ac = await applyCoupon(input.couponCode, subtotal);
    discountCents = ac.discountCents;
    appliedCouponCode = ac.code;
  }
  const grandTotal = Math.max(0, subtotal - discountCents) + shippingCents;

  const provider = getPaymentProvider(input.paymentProviderId);

  // Resolve customer record (link to user if logged in)
  let customerId: number | null = null;
  if (user) {
    const existing = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, user.id))
      .get();
    if (existing) {
      customerId = existing.id;
    } else {
      const inserted = await db
        .insert(customers)
        .values({
          userId: user.id,
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
        })
        .returning({ id: customers.id });
      customerId = inserted[0]!.id;
    }
  }

  const orderNumber = nextOrderNumber(db);

  // Single atomic transaction for order + items + addr + shipment + history + cart clear
  const orderRow = db.transaction((tx) => {
    const [created] = tx
      .insert(orders)
      .values({
        orderNumber,
        customerId,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        subtotalCents: subtotal,
        discountTotalCents: discountCents,
        shippingTotalCents: shippingCents,
        grandTotalCents: grandTotal,
        currency: "SGD",
        couponCode: appliedCouponCode,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        notes: input.notes ?? null,
      })
      .returning()
      .all();

    for (const line of validated) {
      tx.insert(orderItems)
        .values({
          orderId: created!.id,
          productId: line.productId,
          productName: line.name,
          productSku: line.sku,
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
          lineSubtotalCents: line.lineSubtotalCents,
        })
        .run();
    }

    tx.insert(shippingAddresses)
      .values({
        orderId: created!.id,
        recipientName: input.shippingAddress.recipientName,
        phone: input.customer.phone,
        addressLine: input.shippingAddress.addressLine,
        addressLine2: input.shippingAddress.addressLine2 ?? null,
        city: input.shippingAddress.city,
        province: input.shippingAddress.province ?? null,
        postalCode: input.shippingAddress.postalCode,
        country: input.shippingAddress.country,
      })
      .run();

    tx.insert(shipments)
      .values({
        orderId: created!.id,
        shippingCostCents: shippingCents,
        shippingStatus: "not_shipped",
        courierName: input.selectedShipping?.courierName ?? null,
        shippingService: input.selectedShipping?.serviceName ?? null,
        easyParcelServiceId: input.selectedShipping?.serviceId ?? null,
        easyParcelCourierId: input.selectedShipping?.courierId ?? null,
      })
      .run();

    const nowSec = Math.floor(Date.now() / 1000);
    tx.insert(orderStatusHistory)
      .values([
        {
          orderId: created!.id,
          statusType: "order",
          oldStatus: null,
          newStatus: "pending",
          title: "Order placed",
          description: "Order created and awaiting payment",
          changedByRole: "system",
          createdAt: nowSec,
        },
        {
          orderId: created!.id,
          statusType: "payment",
          oldStatus: null,
          newStatus: "unpaid",
          title: "Awaiting payment",
          description: "Customer must complete simulated payment",
          changedByRole: "system",
          createdAt: nowSec,
        },
        {
          orderId: created!.id,
          statusType: "shipping",
          oldStatus: null,
          newStatus: "not_shipped",
          title: "Not shipped",
          description: "Awaiting payment confirmation",
          changedByRole: "system",
          createdAt: nowSec,
        },
      ])
      .run();

    if (cart.cartId) {
      tx.delete(cartItems).where(eq(cartItems.cartId, cart.cartId)).run();
    }

    return created!;
  });

  // Create payment record via the chosen provider (outside the order tx —
  // payment record is non-load-bearing for order existence)
  const created = await provider.createPayment({
    orderId: orderRow.id,
    orderNumber: orderRow.orderNumber,
    amountCents: orderRow.grandTotalCents,
    customerEmail: orderRow.customerEmail,
    customerName: orderRow.customerName,
  });

  await db.insert(payments).values({
    orderId: orderRow.id,
    paymentMethod: created.paymentMethod,
    paymentProvider: provider.id as Exclude<typeof provider.id, "stripe">,
    paymentStatus: created.initialStatus,
    transactionReference: created.transactionReference,
    amountCents: orderRow.grandTotalCents,
  });

  if (created.initialStatus !== "unpaid") {
    await db.insert(orderStatusHistory).values({
      orderId: orderRow.id,
      statusType: "payment",
      oldStatus: "unpaid",
      newStatus: created.initialStatus,
      title:
        created.initialStatus === "pending"
          ? "Payment pending"
          : `Payment ${created.initialStatus}`,
      description: `Payment provider: ${provider.displayName}`,
      changedByRole: "system",
    });
    await db
      .update(orders)
      .set({
        paymentStatus: created.initialStatus,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(orders.id, orderRow.id));
  }

  if (appliedCouponCode) await recordCouponUse(appliedCouponCode);

  return {
    orderId: orderRow.id,
    orderNumber: orderRow.orderNumber,
    payment: {
      method: created.paymentMethod,
      reference: created.transactionReference,
      instructions: created.instructions,
      redirectUrl: created.redirectUrl,
    },
  };
}
