"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingDoodles } from "./FloatingDoodles";

type Slide = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  slideType: string;
};

function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?w=${w}&q=90&auto=format&fit=crop`;
}

/*
 * Hero overlay: left-biased semi-transparent gradient.
 * Real photographic image is always required behind this.
 */
const OVERLAY =
  "linear-gradient(to right, rgba(8,61,79,0.78) 0%, rgba(8,61,79,0.50) 55%, rgba(8,61,79,0.16) 100%)";

const FALLBACK_IMAGE = unsplash("photo-1519708227418-c8fd9a32b7a2");

/*
 * Static fallback slides — each has a real Unsplash seafood photograph.
 * Gradients are forbidden as the sole background.
 */
const STATIC_SLIDES: Slide[] = [
  {
    id: 0,
    title: "Fresh from the Sea to Your Table.",
    subtitle: "Live crabs, sashimi-grade fish, IQF frozen prawns — sourced daily and delivered islandwide.",
    ctaLabel: "Shop Now",
    ctaUrl: "/shop",
    slideType: "welcome",
    imageUrl: unsplash("photo-1519708227418-c8fd9a32b7a2"),
  },
  {
    id: 1,
    title: "This Week's Fresh Deals.",
    subtitle: "Hand-picked specials from our fishermen partners. Limited stock — order before it sells out.",
    ctaLabel: "Shop All Deals",
    ctaUrl: "/shop",
    slideType: "promo",
    imageUrl: unsplash("photo-1560717789-0ac7c58ac90a"),
  },
  {
    id: 2,
    title: "Get Notified. Order Fresh.",
    subtitle: "Sign up for back-in-stock and new arrival alerts — we'll tell you the moment your favourite seafood is available.",
    ctaLabel: "Set Up Alerts",
    ctaUrl: "/subscriptions",
    slideType: "subscription",
    imageUrl: unsplash("photo-1565680018434-b513d5e5fd47"),
  },
  {
    id: 3,
    title: "Live · Fresh · Frozen · Bundles.",
    subtitle: "Browse our seafood categories — from live tanks to freezer-ready packs for the whole family.",
    ctaLabel: "Browse Categories",
    ctaUrl: "/shop",
    slideType: "category",
    imageUrl: unsplash("photo-1534482421-64566f976cfa"),
  },
  {
    id: 4,
    title: "Questions? Chat with Us on WhatsApp.",
    subtitle: "Our team is online 8am–9pm daily. Ask about products, orders, custom cuts, or anything else.",
    ctaLabel: "Chat on WhatsApp",
    ctaUrl: "https://wa.me/6591234567",
    slideType: "whatsapp",
    imageUrl: unsplash("photo-1510130387422-82bed34b37e9"),
  },
];

export function HeroSlider({ slides: dbSlides }: { slides: Slide[] }) {
  const slides = dbSlides.length > 0 ? dbSlides : STATIC_SLIDES;
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((idx + slides.length) % slides.length);
        setTransitioning(false);
      }, 250);
    },
    [transitioning, slides.length],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current]!;
  /* Resolve image: use the slide's imageUrl if set, else the fallback image */
  const bgImage = slide.imageUrl || FALLBACK_IMAGE;

  return (
    <section className="relative min-h-[52vh] md:min-h-[78vh] lg:min-h-[85vh] overflow-hidden flex items-center">
      {/* Real photographic background — mandatory, no gradient-only fallback */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet={bgImage.includes("unsplash.com") ? bgImage.replace(/w=\d+/, "w=800") : bgImage}
          />
          <source
            media="(max-width: 1024px)"
            srcSet={bgImage.includes("unsplash.com") ? bgImage.replace(/w=\d+/, "w=1200") : bgImage}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            alt={slide.title}
            className="w-full h-full object-cover object-center absolute inset-0"
            loading="eager"
            fetchPriority="high"
            width={1600}
            height={900}
          />
        </picture>
        <FloatingDoodles dense />
        {/* Semi-transparent overlay — left-biased for text readability */}
        <div className="absolute inset-0" style={{ background: OVERLAY }} />
      </div>

      {/* Slide content */}
      <div
        className="relative z-10 w-full"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="container py-10 md:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-white/70 text-xs md:text-sm font-semibold tracking-widest uppercase">
              The Line Seafood
            </p>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-white/85 text-sm md:text-lg max-w-xl leading-relaxed">
                {slide.subtitle}
              </p>
            )}
            {slide.ctaLabel && slide.ctaUrl && (
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50 font-semibold shadow-md"
                >
                  <Link href={slide.ctaUrl}>
                    {slide.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
