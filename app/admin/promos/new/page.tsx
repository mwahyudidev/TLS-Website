import { requireAdmin } from "@/server/lib/session";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromoForm } from "@/components/admin/PromoForm";

export default async function NewPromoPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="New Promo"
        description="Create a weekly promotional campaign"
        back={{ label: "Back to promos", href: "/admin/promos" }}
      />
      <PromoForm />
    </div>
  );
}
