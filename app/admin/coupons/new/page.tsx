import { PageHeader } from "@/components/admin/PageHeader";
import { CouponForm } from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div>
      <PageHeader
        title="New coupon"
        back={{ label: "Back to coupons", href: "/admin/coupons" }}
      />
      <CouponForm />
    </div>
  );
}
