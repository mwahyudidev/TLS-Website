import Link from "next/link";
import { PageHero } from "@/components/storefront/PageHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { listProducts } from "@/server/modules/products/service";
import { listActiveCategories } from "@/server/modules/categories/service";

const GROUP_LABELS: Record<string, string> = {
  "live":         "Live Seafood",
  "fresh-frozen": "Fresh & Frozen",
  "special":      "Special Packs",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; group?: string }>;
}) {
  const sp = await searchParams;
  const [categories, { data: products }] = await Promise.all([
    listActiveCategories(),
    listProducts({
      sort: (sp.sort as "newest" | "price-asc" | "price-desc" | "name") ?? "newest",
      search: sp.q,
      navGroup: sp.group,
      perPage: 48,
    }),
  ]);

  const groups = Array.from(
    new Set(categories.map((c) => c.navGroup).filter(Boolean) as string[])
  );

  return (
    <div>
      <PageHero
        title="All Seafood"
        subtitle="Fresh, live, frozen — everything the sea has to offer, sourced daily and delivered islandwide."
        ctaLabel="Shop Now"
        ctaHref="#products"
        accent="teal"
        imageUrl="https://images.unsplash.com/photo-1534482421-64566f976cfa?w=1600&q=90&auto=format&fit=crop"
      />

      <div className="container py-10" id="products">
        {/* Group filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/shop"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${!sp.group ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            All
          </Link>
          {groups.map((g) => (
            <Link
              key={g}
              href={`/shop?group=${g}${sp.sort ? `&sort=${sp.sort}` : ""}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${sp.group === g ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              {GROUP_LABELS[g] ?? g}
            </Link>
          ))}
        </div>

        {/* Sub-category pills when group is active */}
        {sp.group && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories
              .filter((c) => c.navGroup === sp.group)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        )}

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{products.length} products</p>
          <div className="flex gap-2 text-sm">
            {[
              { label: "Newest",  value: "newest" },
              { label: "Price ↑", value: "price-asc" },
              { label: "Price ↓", value: "price-desc" },
            ].map((o) => (
              <Link
                key={o.value}
                href={`/shop?sort=${o.value}${sp.group ? `&group=${sp.group}` : ""}`}
                className={`px-3 py-1 rounded border text-xs transition-colors ${sp.sort === o.value || (!sp.sort && o.value === "newest") ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent"}`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
