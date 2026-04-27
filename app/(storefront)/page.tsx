import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  ShieldCheck,
  Bell,
  Truck,
  UtensilsCrossed,
  MessageCircle,
} from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { FloatingDoodles } from "@/components/storefront/FloatingDoodles";
import { NewsletterForm } from "@/components/storefront/NewsletterForm";
import { getFeaturedProducts } from "@/server/modules/products/service";
import { listActivePromos } from "@/server/modules/promos/service";
import { getFeaturedRecipes } from "@/server/modules/recipes/service";
import { listActiveHeroSlides } from "@/server/modules/hero-slides/service";

/* ── Category cards — real Unsplash seafood imagery ── */
const SHOP_CATEGORIES = [
  {
    name: "Live Seafood",
    slug: "live",
    desc: "Fresh from the tank",
    img: "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=85&auto=format&fit=crop",
  },
  {
    name: "Fresh Catch",
    slug: "fresh",
    desc: "Same-day fresh fish",
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=85&auto=format&fit=crop",
  },
  {
    name: "Frozen Seafood",
    slug: "frozen",
    desc: "IQF frozen at peak",
    img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=85&auto=format&fit=crop",
  },
  {
    name: "Child Pack",
    slug: "child-pack",
    desc: "Boneless, kid-friendly",
    img: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=85&auto=format&fit=crop",
  },
  {
    name: "Bundle Deals",
    slug: "bundles",
    desc: "Value family bundles",
    img: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&q=85&auto=format&fit=crop",
  },
];

const WHY_US = [
  {
    Icon: Star,
    title: "Freshness Guaranteed",
    desc: "Every order backed by our freshness promise. Not satisfied? We'll replace or refund — no questions asked.",
  },
  {
    Icon: Truck,
    title: "Islandwide Delivery",
    desc: "We deliver across all of Singapore, 6 days a week with same-day and next-morning slots available.",
  },
  {
    Icon: ShieldCheck,
    title: "Transparent Sourcing",
    desc: "Every product includes origin, freshness notes, and storage tips. No surprises, ever.",
  },
  {
    Icon: Clock,
    title: "Morning Fresh",
    desc: "Packed each morning at 5am. Order by 10pm the night before for guaranteed AM delivery.",
  },
];

export default async function HomePage() {
  const [heroSlides, featured, promos, recipes] = await Promise.all([
    listActiveHeroSlides(),
    getFeaturedProducts(8),
    listActivePromos(),
    getFeaturedRecipes(3),
  ]);

  return (
    <div className="overflow-x-hidden">

      {/* ── 1. HERO SLIDER ── */}
      <HeroSlider slides={heroSlides} />

      {/* ── 2. SHOP BY CATEGORY — brand surface background ── */}
      <section style={{ background: "var(--color-surface)" }} className="py-10 md:py-20">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span
                className="inline-block rounded-full text-xs font-bold px-4 py-1.5 mb-4 uppercase tracking-widest"
                style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-light)" }}
              >
                Browse
              </span>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
                style={{ color: "var(--color-navy)" }}
              >
                Shop by Category
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--color-text-secondary)" }}>
                What are you looking for today?
              </p>
            </div>
          </ScrollReveal>

          {/* Category image cards — 2 col mobile, 5 col desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {SHOP_CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.slug} delay={i * 70}>
                <Link
                  href={`/shop/${cat.slug}`}
                  className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ aspectRatio: "3/4", boxShadow: "var(--shadow-card)" }}
                >
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width:640px)50vw,(max-width:1024px)33vw,20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Bottom-biased dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,61,79,0.88) 0%, rgba(8,61,79,0.35) 55%, transparent 100%)",
                    }}
                  />
                  {/* Text content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="font-display font-bold text-white text-sm leading-tight">
                      {cat.name}
                    </div>
                    <div className="text-white/70 text-xs mt-0.5">{cat.desc}</div>
                    <div
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all duration-200 group-hover:gap-2"
                      style={{
                        background: "var(--color-primary-light)",
                        color: "white",
                      }}
                    >
                      Browse <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. BEST SELLERS — white + sea doodles ── */}
      {featured.length > 0 && (
        <section className="relative bg-white py-10 md:py-20 overflow-hidden">
          <FloatingDoodles />
          <div className="container relative">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span
                    className="inline-block rounded-full text-xs font-bold px-4 py-1.5 mb-3 uppercase tracking-widest"
                    style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-light)" }}
                  >
                    Popular
                  </span>
                  <h2
                    className="font-display text-3xl md:text-4xl font-bold"
                    style={{ color: "var(--color-navy)" }}
                  >
                    Best Sellers
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Customer favourites, freshly restocked
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-colors hover:opacity-80"
                  style={{ color: "var(--color-primary-light)" }}
                >
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
            {/* 2-col mobile, 4-col desktop product grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {featured.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 55}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. THIS WEEK'S PROMOS — aqua tint with white-blend edges ── */}
      {promos.length > 0 && (
        <section className="relative py-10 md:py-20 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--color-primary-subtle)" }} />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          <div className="container relative">
            {promos.map((promo, pi) => (
              <div key={promo.id} className={pi > 0 ? "mt-16" : ""}>
                <ScrollReveal>
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <span className="inline-block rounded-full bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 mb-3 uppercase tracking-widest">
                        {promo.badgeText ?? "Limited Time"}
                      </span>
                      <h2
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: "var(--color-navy)" }}
                      >
                        {promo.title}
                      </h2>
                      {promo.description && (
                        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {promo.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/shop"
                      className="flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-colors hover:opacity-80"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Shop all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </ScrollReveal>

                {promo.products.length > 0 ? (
                  /* Show linked products as a product card grid */
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    {promo.products.slice(0, 8).map((p, i) => (
                      <ScrollReveal key={p.id} delay={i * 55}>
                        <ProductCard product={p} />
                      </ScrollReveal>
                    ))}
                  </div>
                ) : (
                  /* Fallback: show banner card when no products linked yet */
                  <ScrollReveal>
                    <div
                      className="rounded-2xl bg-white p-6 flex items-center gap-6"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      {promo.imageUrl && (
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          No products linked yet. Add products to this promo in the admin panel.
                        </p>
                        <Link
                          href="/shop"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Browse the shop <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. WHY CHOOSE US — white ── */}
      <section className="bg-white py-10 md:py-20">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2
                className="font-display text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-navy)" }}
              >
                Why The Line Seafood?
              </h2>
              <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>
                Singapore&apos;s most trusted seafood delivery
              </p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((w, i) => (
              <ScrollReveal key={i} delay={i * 70}>
                <div
                  className="group text-center p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white"
                  style={{
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "var(--color-primary-subtle)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <w.Icon className="h-8 w-8" />
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-2"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {w.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {w.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. RECIPES — white + sea doodles ── */}
      {recipes.length > 0 && (
        <section className="relative bg-white py-10 md:py-20 overflow-hidden">
          <FloatingDoodles />
          <div className="container relative">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2
                    className="font-display text-3xl md:text-4xl font-bold"
                    style={{ color: "var(--color-navy)" }}
                  >
                    Recipes &amp; Inspiration
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Cook like a hawker, with our help
                  </p>
                </div>
                <Link
                  href="/recipes"
                  className="flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-colors hover:opacity-80"
                  style={{ color: "var(--color-primary-light)" }}
                >
                  All recipes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {recipes.map((r, i) => (
                <ScrollReveal key={r.id} delay={i * 90}>
                  <Link
                    href={`/recipes/${r.slug}`}
                    className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      boxShadow: "var(--shadow-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div className="relative aspect-[4/3]">
                      {r.imageUrl ? (
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          sizes="(max-width:768px)100vw,33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "var(--color-primary-subtle)" }}
                        >
                          <UtensilsCrossed
                            className="h-12 w-12"
                            style={{ color: "var(--color-primary-light)" }}
                          />
                        </div>
                      )}
                      {r.featured && (
                        <div className="absolute top-3 left-3">
                          <span
                            className="rounded-full text-white text-[10px] font-bold px-3 py-1"
                            style={{ background: "var(--color-primary)" }}
                          >
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] rounded-full px-2.5 py-0.5 capitalize font-semibold"
                          style={{
                            background: "var(--color-primary-subtle)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {r.difficulty}
                        </span>
                        {r.cookTimeMinutes && (
                          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {r.cookTimeMinutes} min
                          </span>
                        )}
                      </div>
                      <h3
                        className="font-semibold text-sm leading-snug transition-colors group-hover:text-[#0B6E6E]"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {r.title}
                      </h3>
                      {r.description && (
                        <p
                          className="text-xs mt-1 line-clamp-2"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {r.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. AVAILABILITY ALERTS CTA — deep navy, editorial ── */}
      <section
        className="relative py-10 md:py-20 overflow-hidden"
        style={{ background: "var(--color-navy)" }}
      >
        <FloatingDoodles />
        <div className="container relative text-center">
          <ScrollReveal>
            <div
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6"
              style={{ background: "rgba(14,158,158,0.2)" }}
            >
              <Bell className="h-8 w-8" style={{ color: "var(--color-accent)" }} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Never Miss Your Favourite Seafood
            </h2>
            <p className="text-white/70 max-w-lg mx-auto text-base md:text-lg mb-10">
              Sign up for back-in-stock and new arrival alerts. We&apos;ll notify you the moment what you
              want is available.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--color-primary-light)",
                  color: "white",
                  boxShadow: "var(--shadow-button)",
                }}
              >
                <Bell className="h-4 w-4" /> Set Up Alerts
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-sm border-2 text-white transition-all duration-200 hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.35)" }}
              >
                Browse Shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/60">
              {[
                "Back-in-stock alerts",
                "New arrival notifications",
                "No recurring charges",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
                  {text}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}