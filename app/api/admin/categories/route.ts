import { ok, fail, parseJson, created } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import {
  listAdminCategories,
  createCategory,
  categoryInputSchema,
} from "@/server/modules/categories/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminCategories());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const input = await parseJson(req, categoryInputSchema);
    return created(await createCategory(input));
  } catch (e) {
    return fail(e);
  }
}
