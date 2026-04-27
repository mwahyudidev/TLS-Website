import { ok, fail, parseJson } from "@/server/lib/api";
import { contactSchema, submitContactMessage } from "@/server/modules/contact/service";

export async function POST(req: Request) {
  try {
    const data = await parseJson(req, contactSchema);
    const msg = await submitContactMessage(data);
    return ok({ id: msg.id });
  } catch (e) {
    return fail(e);
  }
}
