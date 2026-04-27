import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/lib/session";
import { getAdminPromo } from "@/server/modules/promos/admin";
import { AppError } from "@/server/lib/errors";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromoForm } from "@/components/admin/PromoForm";

export default async function EditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let promo;
  try {
    promo = await getAdminPromo(Number(id));
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  return (
    <div>
      <PageHeader
        title={promo.title}
        description="Edit promotional campaign"
        back={{ label: "Back to promos", href: "/admin/promos" }}
      />
      <PromoForm initial={promo} />
    </div>
  );
}
