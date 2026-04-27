import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAllSocialLinks, upsertSocialLink, socialLinkSchema } from "@/server/modules/social/service";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAllSocialLinks());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, socialLinkSchema);
    return ok(await upsertSocialLink(data));
  } catch (e) {
    return fail(e);
  }
}
