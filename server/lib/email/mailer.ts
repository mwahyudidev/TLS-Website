import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export const STORE_NAME = process.env.STORE_NAME ?? "The Line Seafood";
export const STORE_EMAIL = process.env.SMTP_FROM ?? "hello@thelineseafood.sg";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? STORE_EMAIL;
export const STORE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tls-sg.vercel.app";

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.GOOGLE_REFRESH_TOKEN) return; // skip silently if not configured

  try {
    await transporter.sendMail({
      from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}

export function formatSGD(cents: number): string {
  return `S$${(cents / 100).toFixed(2)}`;
}
