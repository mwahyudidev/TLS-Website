import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAdminPages, createPage, pageSchema } from "@/server/modules/content/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminPages());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, pageSchema);
    return ok(await createPage(data));
  } catch (e) {
    return fail(e);
  }
}
