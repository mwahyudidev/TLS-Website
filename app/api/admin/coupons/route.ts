import { ok, fail, parseJson, created } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import {
  listAdminCoupons,
  createCoupon,
  couponInputSchema,
} from "@/server/modules/coupons/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminCoupons());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const input = await parseJson(req, couponInputSchema);
    return created(await createCoupon(input));
  } catch (e) {
    return fail(e);
  }
}
