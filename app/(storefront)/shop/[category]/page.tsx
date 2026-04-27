import Link from "next/link";
import { notFound } from "next/navigation";
import { Waves, Fish, Gift } from "lucide-react";
import { PageHero } from "@/components/storefront/PageHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { listProducts } from "@/server/modules/products/service";
import {
  getCategoryBySlug,
  listActiveCategories,
} from "@/server/modules/categories/service";

type AccentKey = "blue" | "teal" | "navy" | "purple" | "amber";

const ACCENT_BY_GROUP: Record<string, AccentKey> = {
  "live":         "blue",
  "fresh-frozen": "teal",
  "special":      "purple",
};

const ICON_BY_GROUP = {
  "live":         Waves,
  "fresh-frozen": Fish,
  "special":      Gift,
} as const;

export async function generateStaticParams() {
  const cats = await listActiveCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    listActiveCategories(),
  ]);

  if (!category || category.status !== "active") notFound();

  const { data: products } = await listProducts({
    categorySlug: slug,
    sort: (sp.sort as "newest" | "price-asc" | "price-desc") ?? "newest",
    perPage: 48,
  });

  const accent = category.navGroup
    ? (ACCENT_BY_GROUP[category.navGroup] ?? "teal")
    : "teal";

  const CategoryIcon = category.navGroup
    ? (ICON_BY_GROUP[category.navGroup as keyof typeof ICON_BY_GROUP] ?? Fish)
    : Fish;

  const heroImageUrl =
    category.imageUrl ??
    "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=1600&q=90&auto=format&fit=crop";

  const heroSubtitle =
    category.description ??
    `Browse our selection of ${category.name.toLowerCase()} — sourced fresh and delivered islandwide.`;

  return (
    <div>
      <PageHero
        title={category.name}
        subtitle={heroSubtitle}
        accent={accent}
        imageUrl={heroImageUrl}
        ctaLabel="Browse Products"
        ctaHref="#products"
      />

      <div className="container py-10" id="products">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          {category.navGroup && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/shop?group=${category.navGroup}`}
                className="hover:text-foreground capitalize"
              >
                {category.navGroup.replace("-", " & ")}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Sibling category pills */}
        {category.navGroup && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={`/shop?group=${category.navGroup}`}
              className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              All
            </Link>
            {allCategories
              .filter((c) => c.navGroup === category.navGroup)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${c.slug === slug ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                >
                  {c.name}
                </Link>
              ))}
          </div>
        )}

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{products.length} products</p>
          <div className="flex gap-2">
            {[
              { label: "Newest",  value: "newest" },
              { label: "Price ↑", value: "price-asc" },
              { label: "Price ↓", value: "price-desc" },
            ].map((o) => (
              <Link
                key={o.value}
                href={`/shop/${slug}?sort=${o.value}`}
                className={`px-3 py-1 rounded border text-xs transition-colors ${sp.sort === o.value || (!sp.sort && o.value === "newest") ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent"}`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <CategoryIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No products in this category yet. Check back soon!</p>
          </div>
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
