import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { listProducts } from "@/server/modules/products/service";
import { getCategoryBySlug } from "@/server/modules/categories/service";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await getCategoryBySlug(slug);
  if (!cat || cat.status !== "active") notFound();

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const { data: products, meta } = await listProducts({
    categorySlug: slug,
    page,
    perPage: 16,
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-3">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight">{cat.name}</h1>
        {cat.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {cat.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {meta.total} {meta.total === 1 ? "product" : "products"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center">
          <h3 className="text-lg font-medium">No products in this category</h3>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
