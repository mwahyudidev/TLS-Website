import { ok, fail } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAvailabilitySubscriptions } from "@/server/modules/availability-subscriptions/service";

export async function GET() {
  try {
    await requireAdmin();
    const records = await listAvailabilitySubscriptions();
    return ok(records);
  } catch (e) {
    return fail(e);
  }
}
