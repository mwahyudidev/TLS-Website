import { ok, fail, parseJson } from "@/server/lib/api";
import { subscribeSchema, subscribe } from "@/server/modules/newsletter/service";

export async function POST(req: Request) {
  try {
    const data = await parseJson(req, subscribeSchema);
    const result = await subscribe(data);
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
