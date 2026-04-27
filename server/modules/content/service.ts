import "server-only";
import { db } from "@/db/client";
import { contentPages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function getPage(slug: string) {
  const [page] = await db
    .select()
    .from(contentPages)
    .where(and(eq(contentPages.slug, slug), eq(contentPages.status, "published")))
    .all();
  if (!page) throw errors.notFound("Page not found");
  return page;
}

export async function listPublishedPages() {
  return db
    .select()
    .from(contentPages)
    .where(eq(contentPages.status, "published"))
    .all();
}
