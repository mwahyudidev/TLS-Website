import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { CouponForm } from "@/components/admin/CouponForm";
import { getAdminCoupon } from "@/server/modules/coupons/admin";
import { AppError } from "@/server/lib/errors";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cid = Number(id);
  if (!Number.isInteger(cid)) notFound();
  let c;
  try {
    c = await getAdminCoupon(cid);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  return (
    <div>
      <PageHeader
        title={c.code}
        description="Edit coupon"
        back={{ label: "Back to coupons", href: "/admin/coupons" }}
      />
      <CouponForm
        initial={{
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minimumOrderCents: c.minimumOrderCents,
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          status: c.status,
          startsAtUnix: c.startsAt,
          expiresAtUnix: c.expiresAt,
        }}
      />
    </div>
  );
}
