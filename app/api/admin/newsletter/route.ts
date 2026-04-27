import { ok, fail } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listSubscribers } from "@/server/modules/newsletter/service";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listSubscribers());
  } catch (e) {
    return fail(e);
  }
}
