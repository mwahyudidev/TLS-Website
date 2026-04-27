import "server-only";
import { db } from "@/db/client";
import { contentPages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["published", "draft"]).default("published"),
});

export async function listAdminPages() {
  return db.select().from(contentPages).orderBy(contentPages.slug).all();
}

export async function getAdminPage(id: number) {
  const [page] = await db
    .select()
    .from(contentPages)
    .where(eq(contentPages.id, id))
    .all();
  if (!page) throw errors.notFound("Page not found");
  return page;
}

export async function createPage(data: z.infer<typeof pageSchema>) {
  const [row] = await db.insert(contentPages).values(data).returning();
  return row!;
}

export async function updatePage(id: number, data: Partial<z.infer<typeof pageSchema>>) {
  await getAdminPage(id);
  const [row] = await db
    .update(contentPages)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(contentPages.id, id))
    .returning();
  return row!;
}

export async function deletePage(id: number) {
  await getAdminPage(id);
  await db.delete(contentPages).where(eq(contentPages.id, id));
}
