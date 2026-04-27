import { fail, noContent } from "@/server/lib/api";
import { logout } from "@/server/modules/auth/service";

export async function POST() {
  try {
    await logout();
    return noContent();
  } catch (e) {
    return fail(e);
  }
}
