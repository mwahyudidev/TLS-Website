import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader
        title="New category"
        back={{ label: "Back to categories", href: "/admin/categories" }}
      />
      <CategoryForm />
    </div>
  );
}
