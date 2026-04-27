import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { getAllSettings, setSettings } from "@/server/modules/settings/service";

const schema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1).max(100),
      value: z.unknown(),
    }),
  ),
});

export async function GET() {
  try {
    await requireAdmin();
    return ok(await getAllSettings());
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const input = await parseJson(req, schema);
    await setSettings(input.entries);
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
