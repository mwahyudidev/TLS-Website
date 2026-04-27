"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { ProductSummary } from "@/server/modules/products/service";
import { QuickAddButton } from "@/components/storefront/QuickAddButton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=85&auto=format&fit=crop";

export function ProductCard({
  product,
  className,
}: {
  product: ProductSummary;
  className?: string;
}) {
  const onSale =
    product.compareAtPriceCents !== null &&
    product.compareAtPriceCents > product.priceCents;

  const outOfStock = product.stock <= 0;

  const discountPct = onSale
    ? Math.round(
        ((product.compareAtPriceCents! - product.priceCents) /
          product.compareAtPriceCents!) *
          100,
      )
    : 0;

  // weightGrams exists on ProductDetail (superset of ProductSummary)
  const weightGrams = (product as ProductSummary & { weightGrams?: number })
    .weightGrams;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group block", className)}
    >
      {/* Card container */}
      <div
        className="rounded-2xl overflow-hidden border border-[#D0EBEB] bg-white transition-all duration-300 hover:-translate-y-1 shadow-brand-card hover:shadow-brand-card-hover"
      >
        {/* ── Image section ── */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrl ?? FALLBACK_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
              outOfStock && "opacity-70",
            )}
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {onSale && (
              <span className="rounded-full bg-[#EF4444] px-2 py-0.5 text-[10px] font-bold text-white">
                −{discountPct}%
              </span>
            )}
            {outOfStock && (
              <span className="rounded-full bg-[#083D4F] px-2 py-0.5 text-[10px] font-bold text-white">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* ── Info section ── */}
        <div className="p-3 space-y-2">
          {/* Category tag */}
          {product.categoryNames[0] && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0E9E9E]">
              {product.categoryNames[0]}
            </p>
          )}

          {/* Product name */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-[#0D2B35] group-hover:text-[#0B6E6E] transition-colors">
            {product.name}
          </h3>

          {/* Weight — only when available (ProductDetail superset) */}
          {weightGrams != null && weightGrams > 0 && (
            <p className="text-xs text-[#4A7B86]">{weightGrams}g</p>
          )}

          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-[#0B6E6E]">
              {formatMoney(product.priceCents)}
            </span>
            {onSale && (
              <span className="text-xs text-[#4A7B86] line-through">
                {formatMoney(product.compareAtPriceCents!)}
              </span>
            )}
          </div>

          {/* Quick Add — stop link navigation on click */}
          {!outOfStock && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <QuickAddButton productId={product.id} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
