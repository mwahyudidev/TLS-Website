import { STORE_NAME, STORE_EMAIL, STORE_URL, formatSGD } from "./mailer";

// ─── Base Layout ────────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${STORE_NAME}</h1>
            <p style="margin:4px 0 0;color:#7dd3fc;font-size:13px;">Singapore's freshest seafood, delivered to your door</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0;color:#64748b;font-size:12px;">
              <strong>${STORE_NAME}</strong> · Tampines, Singapore 520000
            </p>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">
              ${STORE_EMAIL} · +65 9123 4567 ·
              <a href="https://wa.me/6591234567" style="color:#0369a1;text-decoration:none;">WhatsApp</a>
            </p>
            <p style="margin:12px 0 0;color:#cbd5e1;font-size:11px;">
              © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Reusable Blocks ────────────────────────────────────────────────────────

function heading(text: string) {
  return `<h2 style="margin:0 0 8px;color:#0c4a6e;font-size:20px;font-weight:700;">${text}</h2>`;
}

function subtext(text: string) {
  return `<p style="margin:0 0 24px;color:#64748b;font-size:14px;">${text}</p>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
}

function button(label: string, url: string) {
  return `<div style="margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:#0369a1;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;font-weight:600;">${label}</a>
  </div>`;
}

function badge(text: string, color = "#0369a1") {
  return `<span style="display:inline-block;background:${color};color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${text}</span>`;
}

function infoBox(rows: { label: string; value: string }[]) {
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;color:#64748b;font-size:13px;width:40%;border-bottom:1px solid #f1f5f9;">${r.label}</td>
          <td style="padding:8px 12px;color:#0f172a;font-size:13px;font-weight:500;border-bottom:1px solid #f1f5f9;">${r.value}</td>
        </tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;overflow:hidden;">
    ${rowsHtml}
  </table>`;
}

type OrderItem = { productName: string; productSku: string; quantity: number; unitPriceCents: number; lineSubtotalCents: number };

function orderItemsTable(items: OrderItem[]) {
  const rows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:10px 12px;color:#334155;font-size:13px;border-bottom:1px solid #f1f5f9;">
            <strong>${it.productName}</strong><br/>
            <span style="color:#94a3b8;font-size:12px;">SKU: ${it.productSku}</span>
          </td>
          <td style="padding:10px 12px;color:#64748b;font-size:13px;text-align:center;border-bottom:1px solid #f1f5f9;">×${it.quantity}</td>
          <td style="padding:10px 12px;color:#334155;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${formatSGD(it.lineSubtotalCents)}</td>
        </tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;overflow:hidden;">
    <tr style="background:#e0f2fe;">
      <th style="padding:10px 12px;text-align:left;color:#0369a1;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
      <th style="padding:10px 12px;text-align:center;color:#0369a1;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
      <th style="padding:10px 12px;text-align:right;color:#0369a1;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
    </tr>
    ${rows}
  </table>`;
}

function orderTotals(subtotal: number, discount: number, shipping: number, grand: number, coupon?: string | null) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr>
      <td style="padding:4px 12px;color:#64748b;font-size:13px;">Subtotal</td>
      <td style="padding:4px 12px;text-align:right;color:#334155;font-size:13px;">${formatSGD(subtotal)}</td>
    </tr>
    ${discount > 0 ? `<tr>
      <td style="padding:4px 12px;color:#16a34a;font-size:13px;">Discount${coupon ? ` (${coupon})` : ""}</td>
      <td style="padding:4px 12px;text-align:right;color:#16a34a;font-size:13px;">−${formatSGD(discount)}</td>
    </tr>` : ""}
    <tr>
      <td style="padding:4px 12px;color:#64748b;font-size:13px;">Shipping</td>
      <td style="padding:4px 12px;text-align:right;color:#334155;font-size:13px;">${shipping === 0 ? "FREE" : formatSGD(shipping)}</td>
    </tr>
    <tr style="border-top:2px solid #e2e8f0;">
      <td style="padding:10px 12px;color:#0c4a6e;font-size:15px;font-weight:700;">Total</td>
      <td style="padding:10px 12px;text-align:right;color:#0c4a6e;font-size:15px;font-weight:700;">${formatSGD(grand)}</td>
    </tr>
  </table>`;
}

// ─── 1. Order Confirmation (Customer) ───────────────────────────────────────

export type OrderConfirmationData = {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalCents: number;
  discountTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentInstructions?: string | null;
  shippingAddress: {
    recipientName: string;
    addressLine: string;
    addressLine2?: string | null;
    city: string;
    postalCode: string;
    country: string;
  };
};

export function orderConfirmationTemplate(d: OrderConfirmationData): string {
  const body = `
    ${heading("Order Confirmed! 🎉")}
    ${subtext(`Hi ${d.customerName}, thank you for your order. We've received it and will start preparing it shortly.`)}

    ${infoBox([
      { label: "Order Number", value: `<strong style="color:#0369a1;">${d.orderNumber}</strong>` },
      { label: "Payment Method", value: d.paymentMethod },
      { label: "Deliver To", value: `${d.shippingAddress.recipientName}<br/>${d.shippingAddress.addressLine}${d.shippingAddress.addressLine2 ? ", " + d.shippingAddress.addressLine2 : ""}, ${d.shippingAddress.city} ${d.shippingAddress.postalCode}, ${d.shippingAddress.country}` },
    ])}

    <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:600;">Order Summary</p>
    ${orderItemsTable(d.items)}
    ${orderTotals(d.subtotalCents, d.discountTotalCents, d.shippingTotalCents, d.grandTotalCents, d.couponCode)}

    ${d.paymentInstructions ? `
    ${divider()}
    <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:600;">Payment Instructions</p>
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:8px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">${d.paymentInstructions.replace(/\n/g, "<br/>")}</p>
    </div>` : ""}

    ${divider()}
    ${button("Track My Order", `${STORE_URL}/track-order`)}
    ${paragraph("Questions? Reply to this email or reach us on <a href='https://wa.me/6591234567' style='color:#0369a1;'>WhatsApp</a>.")}
  `;
  return layout(`Order Confirmed – ${d.orderNumber}`, body);
}

// ─── 2. New Order Alert (Admin) ──────────────────────────────────────────────

export function newOrderAdminTemplate(d: OrderConfirmationData & { customerEmail: string; customerPhone?: string | null }): string {
  const body = `
    ${heading(`New Order: ${d.orderNumber}`)}
    ${subtext("A new order has been placed and requires your attention.")}

    ${infoBox([
      { label: "Order Number", value: d.orderNumber },
      { label: "Customer", value: d.customerName },
      { label: "Email", value: d.customerEmail },
      { label: "Phone", value: d.customerPhone ?? "—" },
      { label: "Payment", value: d.paymentMethod },
      { label: "Order Total", value: `<strong>${formatSGD(d.grandTotalCents)}</strong>` },
    ])}

    ${orderItemsTable(d.items)}
    ${orderTotals(d.subtotalCents, d.discountTotalCents, d.shippingTotalCents, d.grandTotalCents, d.couponCode)}

    ${divider()}
    <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:600;">Shipping Address</p>
    ${infoBox([
      { label: "Recipient", value: d.shippingAddress.recipientName },
      { label: "Address", value: `${d.shippingAddress.addressLine}${d.shippingAddress.addressLine2 ? ", " + d.shippingAddress.addressLine2 : ""}` },
      { label: "City / Postal", value: `${d.shippingAddress.city} ${d.shippingAddress.postalCode}` },
      { label: "Country", value: d.shippingAddress.country },
    ])}

    ${button("View Order in Admin", `${STORE_URL}/admin/orders`)}
  `;
  return layout(`New Order ${d.orderNumber} – ${STORE_NAME} Admin`, body);
}

// ─── 3. Payment Confirmed (Customer) ────────────────────────────────────────

export function paymentConfirmedTemplate(d: {
  customerName: string;
  orderNumber: string;
  amountCents: number;
  paymentMethod: string;
}): string {
  const body = `
    ${heading("Payment Confirmed ✅")}
    ${subtext(`Hi ${d.customerName}, we've received your payment. Your order is now being processed.`)}

    ${infoBox([
      { label: "Order Number", value: `<strong style="color:#0369a1;">${d.orderNumber}</strong>` },
      { label: "Amount Paid", value: `<strong>${formatSGD(d.amountCents)}</strong>` },
      { label: "Payment Method", value: d.paymentMethod },
      { label: "Status", value: badge("Paid", "#16a34a") },
    ])}

    ${paragraph("We'll notify you once your order is packed and ready for shipment. Estimated delivery is typically 1–3 business days.")}

    ${button("Track My Order", `${STORE_URL}/track-order`)}
  `;
  return layout(`Payment Confirmed – ${d.orderNumber}`, body);
}

// ─── 4. Payment Failed (Customer) ───────────────────────────────────────────

export function paymentFailedTemplate(d: {
  customerName: string;
  orderNumber: string;
  reason?: string | null;
}): string {
  const body = `
    ${heading("Payment Issue ❌")}
    ${subtext(`Hi ${d.customerName}, we were unable to confirm your payment for order ${d.orderNumber}.`)}

    ${infoBox([
      { label: "Order Number", value: d.orderNumber },
      { label: "Status", value: badge("Payment Failed", "#dc2626") },
      ...(d.reason ? [{ label: "Reason", value: d.reason }] : []),
    ])}

    ${paragraph("Please contact us to arrange an alternative payment or re-place your order.")}

    ${button("Contact Us via WhatsApp", "https://wa.me/6591234567")}
    ${paragraph(`Or email us at <a href="mailto:${STORE_EMAIL}" style="color:#0369a1;">${STORE_EMAIL}</a>.`)}
  `;
  return layout(`Payment Failed – ${d.orderNumber}`, body);
}

// ─── 5. Order Cancelled (Customer) ──────────────────────────────────────────

export function orderCancelledTemplate(d: {
  customerName: string;
  orderNumber: string;
  reason?: string | null;
}): string {
  const body = `
    ${heading("Order Cancelled")}
    ${subtext(`Hi ${d.customerName}, your order ${d.orderNumber} has been cancelled.`)}

    ${infoBox([
      { label: "Order Number", value: d.orderNumber },
      { label: "Status", value: badge("Cancelled", "#64748b") },
      ...(d.reason ? [{ label: "Reason", value: d.reason }] : []),
    ])}

    ${paragraph("If you believe this is a mistake or would like to re-order, please contact us.")}

    ${button("Shop Again", `${STORE_URL}/shop`)}
    ${paragraph(`Questions? Reach us at <a href="https://wa.me/6591234567" style="color:#0369a1;">WhatsApp</a> or <a href="mailto:${STORE_EMAIL}" style="color:#0369a1;">${STORE_EMAIL}</a>.`)}
  `;
  return layout(`Order Cancelled – ${d.orderNumber}`, body);
}

// ─── 6. Order Refunded (Customer) ───────────────────────────────────────────

export function orderRefundedTemplate(d: {
  customerName: string;
  orderNumber: string;
  amountCents: number;
  reason?: string | null;
}): string {
  const body = `
    ${heading("Refund Issued 💰")}
    ${subtext(`Hi ${d.customerName}, your refund for order ${d.orderNumber} has been processed.`)}

    ${infoBox([
      { label: "Order Number", value: d.orderNumber },
      { label: "Refund Amount", value: `<strong>${formatSGD(d.amountCents)}</strong>` },
      { label: "Status", value: badge("Refunded", "#7c3aed") },
      ...(d.reason ? [{ label: "Notes", value: d.reason }] : []),
    ])}

    ${paragraph("Refunds typically reflect in your account within 3–5 business days depending on your bank.")}
    ${paragraph("Thank you for shopping with us. We hope to serve you again soon!")}

    ${button("Shop Again", `${STORE_URL}/shop`)}
  `;
  return layout(`Refund Issued – ${d.orderNumber}`, body);
}

// ─── 7. Order Shipped (Customer) ────────────────────────────────────────────

export function orderShippedTemplate(d: {
  customerName: string;
  orderNumber: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: number | null;
}): string {
  const estDelivery = d.estimatedDelivery
    ? new Date(d.estimatedDelivery * 1000).toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" })
    : null;

  const body = `
    ${heading("Your Order is On Its Way! 🚚")}
    ${subtext(`Hi ${d.customerName}, great news — your order ${d.orderNumber} has been shipped.`)}

    ${infoBox([
      { label: "Order Number", value: `<strong style="color:#0369a1;">${d.orderNumber}</strong>` },
      { label: "Status", value: badge("Shipped", "#0369a1") },
      ...(d.courierName ? [{ label: "Courier", value: d.courierName }] : []),
      ...(d.trackingNumber ? [{ label: "Tracking Number", value: `<strong>${d.trackingNumber}</strong>` }] : []),
      ...(estDelivery ? [{ label: "Est. Delivery", value: estDelivery }] : []),
    ])}

    ${paragraph("Please ensure someone is available to receive your delivery. For live seafood, please refrigerate or cook immediately.")}

    ${button("Track My Order", `${STORE_URL}/track-order`)}
    ${paragraph(`Issues with delivery? Contact us on <a href="https://wa.me/6591234567" style="color:#0369a1;">WhatsApp</a>.`)}
  `;
  return layout(`Your Order Has Shipped – ${d.orderNumber}`, body);
}

// ─── 8. Order Status Update (Customer) ──────────────────────────────────────

const statusLabels: Record<string, { label: string; color: string; message: string }> = {
  processing: { label: "Processing", color: "#0369a1", message: "We're preparing your order. This usually takes 30–60 minutes." },
  packed: { label: "Packed & Ready", color: "#0891b2", message: "Your order has been packed and is ready for collection by our courier." },
  delivered: { label: "Delivered", color: "#16a34a", message: "Your order has been delivered. Enjoy your fresh seafood!" },
  completed: { label: "Completed", color: "#16a34a", message: "Your order is complete. Thank you for shopping with us!" },
};

export function orderStatusUpdateTemplate(d: {
  customerName: string;
  orderNumber: string;
  newStatus: string;
}): string {
  const info = statusLabels[d.newStatus] ?? { label: d.newStatus, color: "#64748b", message: `Your order status has been updated to ${d.newStatus}.` };

  const body = `
    ${heading("Order Update")}
    ${subtext(`Hi ${d.customerName}, here's an update on your order.`)}

    ${infoBox([
      { label: "Order Number", value: `<strong style="color:#0369a1;">${d.orderNumber}</strong>` },
      { label: "Status", value: badge(info.label, info.color) },
    ])}

    ${paragraph(info.message)}

    ${button("View Order", `${STORE_URL}/track-order`)}
  `;
  return layout(`Order Update – ${d.orderNumber}`, body);
}

// ─── 9. Welcome Email (Customer Registration) ───────────────────────────────

export function welcomeTemplate(d: { name: string }): string {
  const body = `
    ${heading(`Welcome, ${d.name}! 🦞`)}
    ${subtext("Your account has been created. Here's what you can do:")}

    <ul style="color:#334155;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>Browse and order live, fresh, and frozen seafood</li>
      <li>Track all your orders from your account dashboard</li>
      <li>Save your shipping address for faster checkout</li>
      <li>Subscribe to weekly seafood deals</li>
    </ul>

    ${button("Start Shopping", `${STORE_URL}/shop`)}
    ${divider()}
    ${paragraph(`Questions? We're on <a href="https://wa.me/6591234567" style="color:#0369a1;">WhatsApp</a> daily from 8am–9pm.`)}
  `;
  return layout(`Welcome to ${STORE_NAME}`, body);
}

// ─── 10. Contact Auto-Reply (Customer) ──────────────────────────────────────

export function contactAutoReplyTemplate(d: { name: string; subject: string; message: string }): string {
  const body = `
    ${heading("We've Received Your Message ✉️")}
    ${subtext(`Hi ${d.name}, thank you for reaching out. We'll get back to you within 24 hours.`)}

    ${infoBox([
      { label: "Subject", value: d.subject },
      { label: "Your Message", value: `<span style="white-space:pre-wrap;">${d.message}</span>` },
    ])}

    ${paragraph("In the meantime, for urgent queries about your order, you can reach us directly on WhatsApp.")}
    ${button("Chat on WhatsApp", "https://wa.me/6591234567")}
  `;
  return layout("We Received Your Message", body);
}

// ─── 11. Contact Admin Alert ─────────────────────────────────────────────────

export function contactAdminTemplate(d: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): string {
  const body = `
    ${heading("New Contact Form Submission")}

    ${infoBox([
      { label: "Name", value: d.name },
      { label: "Email", value: `<a href="mailto:${d.email}" style="color:#0369a1;">${d.email}</a>` },
      { label: "Phone", value: d.phone ?? "—" },
      { label: "Subject", value: d.subject },
    ])}

    <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:600;">Message</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap;">${d.message}</p>
    </div>

    ${button("Reply via Email", `mailto:${d.email}`)}
  `;
  return layout("New Contact Message – Admin", body);
}

// ─── 12. Newsletter Welcome ──────────────────────────────────────────────────

export function newsletterWelcomeTemplate(d: { email: string }): string {
  const body = `
    ${heading("You're Subscribed! 🐟")}
    ${subtext("Thanks for joining The Line Seafood newsletter.")}

    ${paragraph("Here's what to expect in your inbox:")}
    <ul style="color:#334155;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>Weekly fresh catch highlights and specials</li>
      <li>Exclusive subscriber discounts</li>
      <li>New product announcements</li>
      <li>Seasonal seafood tips and recipes</li>
    </ul>

    ${button("Shop This Week's Deals", `${STORE_URL}/shop`)}
    ${divider()}
    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
      You subscribed with ${d.email}. To unsubscribe, reply with "unsubscribe" to this email.
    </p>
  `;
  return layout(`Welcome to ${STORE_NAME} Newsletter`, body);
}
