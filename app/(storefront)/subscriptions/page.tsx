import { Bell, Sparkles, Tag, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/storefront/PageHero";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { NotifyMeButton } from "@/components/storefront/NotifyMeButton";

const ALERT_TYPES = [
  {
    icon: Bell,
    title: "Back in Stock",
    desc: "Get notified the moment a sold-out product is available again. Never miss your favourite cut.",
    type: "back_in_stock" as const,
    color: "bg-teal-100 text-teal-700",
  },
  {
    icon: Sparkles,
    title: "New Arrivals",
    desc: "Be the first to know when we bring in a new species, specialty cut, or limited seasonal catch.",
    type: "new_arrival" as const,
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Tag,
    title: "Category Alerts",
    desc: "Follow a whole category — Live Seafood, Fresh Fish, Frozen — and get notified when new products land.",
    type: "category_alert" as const,
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Globe,
    title: "General Updates",
    desc: "Sign up for occasional updates: promotions, seasonal specials, and new delivery zones.",
    type: "general_update" as const,
    color: "bg-purple-100 text-purple-700",
  },
];

export default function SubscriptionsPage() {
  return (
    <div>
      <PageHero
        title="Stay in the Loop"
        subtitle="Sign up for availability alerts and be first to know when your favourite seafood is back in stock or something new arrives."
        accent="teal"
        imageUrl="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1600&q=90&auto=format&fit=crop"
        ctaLabel="Sign Up Now"
        ctaHref="#notify"
      />

      <div className="container py-12" id="notify">

        {/* What are alerts */}
        <ScrollReveal>
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight">Availability Alerts</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We don&apos;t do recurring boxes. Instead, we notify you when the exact product you want
              becomes available — so you can order fresh, on your own terms.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 alert types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {ALERT_TYPES.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.type} delay={i * 80}>
                <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Sign up form + how it works */}
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">

          {/* General sign-up */}
          <ScrollReveal direction="left">
            <div className="rounded-2xl border p-6 bg-teal-50/50">
              <h2 className="font-bold text-lg mb-1">Sign Up for General Updates</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Get occasional updates on new stock, promotions, and seasonal specials.
              </p>
              <NotifyMeButton />
            </div>
          </ScrollReveal>

          {/* How it works */}
          <ScrollReveal>
            <div className="space-y-5">
              <h2 className="font-bold text-lg">How It Works</h2>
              {[
                { step: "1", title: "Choose what to follow", desc: "Browse the shop and tap \"Notify Me\" on any out-of-stock or upcoming product, or sign up here for general updates." },
                { step: "2", title: "We send you an alert", desc: "When your product is available, we send you a WhatsApp or email notification right away." },
                { step: "3", title: "Order at your convenience", desc: "Click through, add to cart, and check out — no subscription, no commitment, no recurring charge." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* CTA to shop */}
        <ScrollReveal>
          <div className="mt-14 text-center rounded-2xl border bg-muted/30 p-8">
            <h2 className="font-bold text-lg mb-2">Ready to Browse?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Visit the shop and tap &ldquo;Notify Me&rdquo; on any product that&apos;s currently out of stock.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-6 py-3 font-semibold text-sm hover:bg-teal-700 transition-colors"
            >
              Browse the Shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
