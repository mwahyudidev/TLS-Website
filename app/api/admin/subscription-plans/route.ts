import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAdminPlans, createPlan, planSchema } from "@/server/modules/subscriptions/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminPlans());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, planSchema);
    return ok(await createPlan(data));
  } catch (e) {
    return fail(e);
  }
}
