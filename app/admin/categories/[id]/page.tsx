import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getAdminCategory } from "@/server/modules/categories/admin";
import { AppError } from "@/server/lib/errors";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catId = Number(id);
  if (!Number.isInteger(catId)) notFound();
  let cat;
  try {
    cat = await getAdminCategory(catId);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  return (
    <div>
      <PageHeader
        title={cat.name}
        description={`Slug: ${cat.slug}`}
        back={{ label: "Back to categories", href: "/admin/categories" }}
      />
      <CategoryForm
        initial={{
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? "",
          imageUrl: cat.imageUrl,
          status: cat.status,
          navGroup: cat.navGroup ?? null,
          sortOrder: cat.sortOrder,
        }}
      />
    </div>
  );
}
