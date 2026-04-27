import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAdminPromos, createPromo, promoSchema } from "@/server/modules/promos/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminPromos());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, promoSchema);
    return ok(await createPromo(data));
  } catch (e) {
    return fail(e);
  }
}
