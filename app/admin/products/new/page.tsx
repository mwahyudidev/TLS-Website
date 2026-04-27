import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { listAdminCategories } from "@/server/modules/categories/admin";

export default async function NewProductPage() {
  const categories = await listAdminCategories();
  return (
    <div>
      <PageHeader
        title="New product"
        back={{ label: "Back to products", href: "/admin/products" }}
      />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
