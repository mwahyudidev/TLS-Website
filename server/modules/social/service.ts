import "server-only";
import { db } from "@/db/client";
import { socialLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export async function listActiveSocialLinks() {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.isActive, true))
    .orderBy(socialLinks.sortOrder)
    .all();
}

export async function listAllSocialLinks() {
  return db.select().from(socialLinks).orderBy(socialLinks.sortOrder).all();
}

export const socialLinkSchema = z.object({
  platform: z.enum(["instagram", "facebook", "tiktok", "youtube", "whatsapp"]),
  url: z.string().url(),
  label: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function upsertSocialLink(data: z.infer<typeof socialLinkSchema>) {
  const existing = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.platform, data.platform))
    .all();

  if (existing[0]) {
    const [row] = await db
      .update(socialLinks)
      .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(socialLinks.id, existing[0].id))
      .returning();
    return row!;
  }

  const [row] = await db.insert(socialLinks).values(data).returning();
  return row!;
}

export async function getWhatsAppLink() {
  const [link] = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.platform, "whatsapp"))
    .all();
  return link?.url ?? null;
}
