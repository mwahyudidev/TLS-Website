import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingDoodles } from "./FloatingDoodles";

/*
 * Real Unsplash seafood photography used as hero backgrounds.
 * Gradients alone are forbidden — these are the image IDs used
 * when no explicit imageUrl is passed by the page.
 */
const DEFAULT_PHOTO: Record<string, string> = {
  teal:   "photo-1534482421-64566f976cfa", // seafood market / fresh fish
  blue:   "photo-1519708227418-c8fd9a32b7a2", // premium fresh seafood platter
  red:    "photo-1553557215-01b8f9d8e4c3", // crab / promo
  green:  "photo-1510130387422-82bed34b37e9", // contact / fresh catch
  purple: "photo-1519708227418-c8fd9a32b7a2", // terms / policy — neutral seafood
  amber:  "photo-1565680018434-b513d5e5fd47", // prawns / shrimp
  navy:   "photo-1543353071-873f17a7a088", // recipes / cooked seafood
};

const FALLBACK_ID = "photo-1519708227418-c8fd9a32b7a2";

function unsplash(photoId: string, w: number) {
  return `https://images.unsplash.com/${photoId}?w=${w}&q=90&auto=format&fit=crop`;
}

/*
 * Overlay: semi-transparent left-biased gradient so text on the left
 * stays readable while the right shows the image.
 */
const OVERLAY =
  "linear-gradient(to right, rgba(8,61,79,0.78) 0%, rgba(8,61,79,0.50) 50%, rgba(8,61,79,0.18) 100%)";

export function PageHero({
  title,
  subtitle,
  imageUrl,
  ctaLabel,
  ctaHref,
  accent = "teal",
  compact = false,
  showDoodles = true,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  ctaHref?: string;
  accent?: keyof typeof DEFAULT_PHOTO | string;
  compact?: boolean;
  showDoodles?: boolean;
}) {
  const height = compact
    ? "min-h-[32vh] md:min-h-[44vh]"
    : "min-h-[44vh] md:min-h-[58vh]";

  // Resolve image: external URL passed directly, or build from Unsplash photo ID
  const isExternalUrl = imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));
  const photoId = DEFAULT_PHOTO[accent] ?? FALLBACK_ID;
  const fallbackId = FALLBACK_ID;

  return (
    <section className={`relative ${height} overflow-hidden flex items-center`}>
      {/* Real photographic background — always required, never gradient-only */}
      <div className="absolute inset-0 z-0">
        {isExternalUrl ? (
          <img
            src={imageUrl!}
            alt={title}
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            width={1600}
            height={900}
          />
        ) : (
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet={unsplash(photoId, 800)}
            />
            <source
              media="(max-width: 1024px)"
              srcSet={unsplash(photoId, 1200)}
            />
            <img
              src={unsplash(photoId, 1600)}
              /* eslint-disable-next-line @next/next/no-img-element */
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = unsplash(fallbackId, 1600);
              }}
              alt={title}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
              width={1600}
              height={900}
            />
          </picture>
        )}
      </div>

      {/* Decorative sea doodles */}
      {showDoodles && <FloatingDoodles />}

      {/* Semi-transparent overlay for text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: OVERLAY }}
      />

      {/* Hero content */}
      <div className="relative z-20 w-full">
        <div className="container">
          <div className="max-w-2xl space-y-3 py-10 md:py-16">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/85 text-base md:text-lg max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
            {ctaLabel && ctaHref && (
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50 font-semibold shadow-md"
                >
                  <Link href={ctaHref}>
                    {ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
