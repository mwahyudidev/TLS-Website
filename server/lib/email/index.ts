import "server-only";
import { sendMail, ADMIN_EMAIL } from "./mailer";
import {
  orderConfirmationTemplate,
  newOrderAdminTemplate,
  paymentConfirmedTemplate,
  paymentFailedTemplate,
  orderCancelledTemplate,
  orderRefundedTemplate,
  orderShippedTemplate,
  orderStatusUpdateTemplate,
  welcomeTemplate,
  contactAutoReplyTemplate,
  contactAdminTemplate,
  newsletterWelcomeTemplate,
  type OrderConfirmationData,
} from "./templates";

export type { OrderConfirmationData };

// ─── Order Emails ─────────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  to: string,
  data: OrderConfirmationData,
) {
  await sendMail({
    to,
    subject: `Order Confirmed – ${data.orderNumber} | The Line Seafood`,
    html: orderConfirmationTemplate(data),
  });
}

export async function sendNewOrderAlert(
  data: OrderConfirmationData & { customerEmail: string; customerPhone?: string | null },
) {
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New Order ${data.orderNumber} – ${data.customerName}`,
    html: newOrderAdminTemplate(data),
  });
}

// ─── Payment Emails ───────────────────────────────────────────────────────

export async function sendPaymentConfirmed(
  to: string,
  data: { customerName: string; orderNumber: string; amountCents: number; paymentMethod: string },
) {
  await sendMail({
    to,
    subject: `Payment Confirmed – ${data.orderNumber} | The Line Seafood`,
    html: paymentConfirmedTemplate(data),
  });
}

export async function sendPaymentFailed(
  to: string,
  data: { customerName: string; orderNumber: string; reason?: string | null },
) {
  await sendMail({
    to,
    subject: `Payment Issue – ${data.orderNumber} | The Line Seafood`,
    html: paymentFailedTemplate(data),
  });
}

export async function sendOrderCancelled(
  to: string,
  data: { customerName: string; orderNumber: string; reason?: string | null },
) {
  await sendMail({
    to,
    subject: `Order Cancelled – ${data.orderNumber} | The Line Seafood`,
    html: orderCancelledTemplate(data),
  });
}

export async function sendOrderRefunded(
  to: string,
  data: { customerName: string; orderNumber: string; amountCents: number; reason?: string | null },
) {
  await sendMail({
    to,
    subject: `Refund Issued – ${data.orderNumber} | The Line Seafood`,
    html: orderRefundedTemplate(data),
  });
}

// ─── Shipment Emails ──────────────────────────────────────────────────────

export async function sendOrderShipped(
  to: string,
  data: {
    customerName: string;
    orderNumber: string;
    courierName?: string | null;
    trackingNumber?: string | null;
    estimatedDelivery?: number | null;
  },
) {
  await sendMail({
    to,
    subject: `Your Order Has Shipped – ${data.orderNumber} | The Line Seafood`,
    html: orderShippedTemplate(data),
  });
}

// ─── Order Status Emails ──────────────────────────────────────────────────

const STATUS_EMAIL_WHITELIST = new Set(["processing", "packed", "delivered", "completed"]);

export async function sendOrderStatusUpdate(
  to: string,
  data: { customerName: string; orderNumber: string; newStatus: string },
) {
  if (!STATUS_EMAIL_WHITELIST.has(data.newStatus)) return;
  await sendMail({
    to,
    subject: `Order Update – ${data.orderNumber} | The Line Seafood`,
    html: orderStatusUpdateTemplate(data),
  });
}

// ─── Auth Emails ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, data: { name: string }) {
  await sendMail({
    to,
    subject: `Welcome to The Line Seafood, ${data.name}!`,
    html: welcomeTemplate(data),
  });
}

// ─── Contact Emails ───────────────────────────────────────────────────────

export async function sendContactAutoReply(
  to: string,
  data: { name: string; subject: string; message: string },
) {
  await sendMail({
    to,
    subject: `We received your message – The Line Seafood`,
    html: contactAutoReplyTemplate(data),
  });
}

export async function sendContactAdminAlert(
  data: { name: string; email: string; phone?: string | null; subject: string; message: string },
) {
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New Contact: ${data.subject} from ${data.name}`,
    html: contactAdminTemplate(data),
  });
}

// ─── Newsletter Email ─────────────────────────────────────────────────────

export async function sendNewsletterWelcome(to: string) {
  await sendMail({
    to,
    subject: `Welcome to The Line Seafood Newsletter!`,
    html: newsletterWelcomeTemplate({ email: to }),
  });
}
