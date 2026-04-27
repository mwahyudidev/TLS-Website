import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/lib/session";
import { getAdminPage } from "@/server/modules/content/admin";
import { AppError } from "@/server/lib/errors";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentPageForm } from "@/components/admin/ContentPageForm";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let page;
  try {
    page = await getAdminPage(Number(id));
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  return (
    <div>
      <PageHeader title={page.title} description="Edit content page" back={{ label: "Back to pages", href: "/admin/content" }} />
      <ContentPageForm initial={page} />
    </div>
  );
}
