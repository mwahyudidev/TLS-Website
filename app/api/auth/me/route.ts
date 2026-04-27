import { ok, fail } from "@/server/lib/api";
import { getCurrentUser } from "@/server/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (e) {
    return fail(e);
  }
}
