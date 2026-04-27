import { NextResponse } from "next/server";
import { parseJson, fail, created } from "@/server/lib/api";
import { registerSchema } from "@/server/modules/auth/validators";
import { register } from "@/server/modules/auth/service";

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, registerSchema);
    const user = await register(input);
    return created({ user });
  } catch (e) {
    return fail(e);
  }
}
