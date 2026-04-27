import { ok, fail } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listContactMessages } from "@/server/modules/contact/service";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listContactMessages());
  } catch (e) {
    return fail(e);
  }
}
