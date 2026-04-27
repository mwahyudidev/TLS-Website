import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/ProductCard";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { NotifyMeButton } from "@/components/storefront/NotifyMeButton";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/server/modules/products/service";
import { formatMoney } from "@/lib/format";
import { AppError } from "@/server/lib/errors";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }

  const related = await getRelatedProducts(product.id, 4);
  const onSale =
    product.compareAtPriceCents !== null &&
    product.compareAtPriceCents > product.priceCents;
  const outOfStock = product.stock <= 0;

  return (
    <div className="container py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:underline">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div className="space-y-2">
            {product.categoryNames.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {product.categoryNames.join(" · ")}
              </div>
            )}
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">
                {formatMoney(product.priceCents)}
              </span>
              {onSale && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoney(product.compareAtPriceCents!)}
                </span>
              )}
              {onSale && (
                <Badge variant="destructive">
                  Save{" "}
                  {Math.round(
                    ((product.compareAtPriceCents! - product.priceCents) /
                      product.compareAtPriceCents!) *
                      100,
                  )}
                  %
                </Badge>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="text-xs text-muted-foreground space-x-3">
            <span>SKU: {product.sku}</span>
            {product.weightGrams > 0 && (
              <span>Weight: {product.weightGrams}g</span>
            )}
          </div>

          <AddToCartButton
            productId={product.id}
            maxStock={product.stock}
            outOfStock={outOfStock}
          />
          {outOfStock && (
            <NotifyMeButton
              productId={product.id}
              productName={product.name}
            />
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight mb-6">
            You may also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
