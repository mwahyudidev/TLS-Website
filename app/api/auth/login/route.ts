import { ok, parseJson, fail } from "@/server/lib/api";
import { loginSchema } from "@/server/modules/auth/validators";
import { login } from "@/server/modules/auth/service";

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, loginSchema);
    const user = await login(input);
    return ok({ user });
  } catch (e) {
    return fail(e);
  }
}
