import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { listProducts } from "@/server/modules/products/service";
import { listActiveCategories } from "@/server/modules/categories/service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sortValue = (sp.sort as
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name"
    | undefined) ?? "newest";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [{ data: products, meta }, cats] = await Promise.all([
    listProducts({
      search: sp.q,
      categorySlug: sp.category,
      sort: sortValue,
      page,
      perPage: 16,
    }),
    listActiveCategories(),
  ]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    if (sp.sort) params.set("sort", sp.sort);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    }
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">All products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} {meta.total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          <form action="/products" method="get">
            {sp.category && (
              <input type="hidden" name="category" value={sp.category} />
            )}
            {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search products"
              />
            </div>
            <Button type="submit" size="sm" className="mt-2 w-full">
              Apply
            </Button>
          </form>

          <div>
            <div className="text-sm font-medium mb-2">Categories</div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildHref({ category: undefined, page: undefined })}
                  className={cn(
                    "block px-2 py-1 rounded-md hover:bg-accent",
                    !sp.category && "bg-accent",
                  )}
                >
                  All
                </Link>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug, page: undefined })}
                    className={cn(
                      "block px-2 py-1 rounded-md hover:bg-accent",
                      sp.category === c.slug && "bg-accent",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="text-sm text-muted-foreground">
              Page {meta.page} of {Math.max(1, meta.totalPages)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort:</span>
              {(
                [
                  ["newest", "Newest"],
                  ["price-asc", "Price ↑"],
                  ["price-desc", "Price ↓"],
                  ["name", "Name"],
                ] as const
              ).map(([v, label]) => (
                <Link
                  key={v}
                  href={buildHref({ sort: v, page: undefined })}
                  className={cn(
                    "px-2 py-1 rounded-md hover:bg-accent",
                    sortValue === v && "bg-accent font-medium",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try changing your search or filters.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm underline underline-offset-4"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={buildHref({ page: String(p) })}
                    className={cn(
                      "h-9 min-w-9 px-3 inline-flex items-center justify-center rounded-md border",
                      p === meta.page && "bg-primary text-primary-foreground border-primary",
                    )}
                  >
                    {p}
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
