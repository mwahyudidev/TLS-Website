import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { getAdminProduct } from "@/server/modules/products/admin";
import { listAdminCategories } from "@/server/modules/categories/admin";
import { AppError } from "@/server/lib/errors";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  let detail;
  try {
    detail = await getAdminProduct(productId);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const categories = await listAdminCategories();

  return (
    <div>
      <PageHeader
        title={detail.product.name}
        description={`SKU ${detail.product.sku}`}
        back={{ label: "Back to products", href: "/admin/products" }}
      />
      <div className="mb-4 flex justify-end">
        <DeleteProductButton productId={detail.product.id} />
      </div>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          id: detail.product.id,
          name: detail.product.name,
          slug: detail.product.slug,
          description: detail.product.description ?? "",
          priceCents: detail.product.priceCents,
          compareAtPriceCents: detail.product.compareAtPriceCents,
          stock: detail.product.stock,
          sku: detail.product.sku,
          weightGrams: detail.product.weightGrams,
          status: detail.product.status,
          featured: detail.product.featured,
          imageUrl: detail.images[0]?.url ?? null,
          categoryIds: detail.categories.map((c) => c.id),
        }}
      />
    </div>
  );
}
