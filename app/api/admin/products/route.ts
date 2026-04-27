import { ok, fail, parseJson, parseQuery, created } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { z } from "zod";
import {
  listAdminProducts,
  createProduct,
  productInputSchema,
} from "@/server/modules/products/admin";

const querySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(500).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = parseQuery(req, querySchema);
    return ok(await listAdminProducts(q));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const input = await parseJson(req, productInputSchema);
    return created(await createProduct(input));
  } catch (e) {
    return fail(e);
  }
}
