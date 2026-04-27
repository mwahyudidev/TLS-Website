import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPage } from "@/server/modules/content/service";
import { AppError } from "@/server/lib/errors";
import { PageHero } from "@/components/storefront/PageHero";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPage(slug);
    return { title: page.title, description: page.metaDescription ?? undefined };
  } catch {
    return {};
  }
}

const B = "https://images.unsplash.com";
const Q = "?w=1600&q=90&auto=format&fit=crop";

/* Per-slug hero config — accent + subtitle + dedicated seafood photograph */
const SLUG_ACCENT: Record<string, {
  accent: Parameters<typeof PageHero>[0]["accent"];
  subtitle: string;
  imageUrl: string;
}> = {
  "our-story":           { accent: "teal",   imageUrl: `${B}/photo-1476224203421-9ac39bcb3327${Q}`, subtitle: "How The Line Seafood started, and why we're passionate about bringing the freshest seafood to your table." },
  "about":               { accent: "blue",   imageUrl: `${B}/photo-1476224203421-9ac39bcb3327${Q}`, subtitle: "Meet the team behind The Line Seafood and discover what drives our commitment to freshness and quality." },
  "faq":                 { accent: "navy",   imageUrl: `${B}/photo-1519708227418-c8fd9a32b7a2${Q}`, subtitle: "Common questions about ordering, delivery, subscriptions, and more — answered clearly." },
  "terms-and-conditions":{ accent: "purple", imageUrl: `${B}/photo-1534482421-64566f976cfa${Q}`,   subtitle: "Our terms of service. Please read carefully before placing an order with us." },
  "privacy-policy":      { accent: "navy",   imageUrl: `${B}/photo-1534482421-64566f976cfa${Q}`,   subtitle: "How we collect, use, and protect your personal data." },
};

function renderBody(body: string | null): ReactNode {
  if (!body) return null;
  try {
    const data = JSON.parse(body) as Record<string, unknown>;

    // Our Story
    if (data.intro && data.paragraphs) {
      const paras = data.paragraphs as string[];
      return (
        <div className="prose prose-sm max-w-none">
          <p className="text-lg font-medium text-teal-700">{String(data.intro)}</p>
          {paras.map((p, i) => <p key={i}>{p}</p>)}
          {Boolean(data.mission) && (
            <blockquote className="border-l-4 border-teal-500 pl-4 italic text-teal-700">
              {String(data.mission)}
            </blockquote>
          )}
        </div>
      );
    }

    // FAQ
    if (data.sections && Array.isArray(data.sections) && (data.sections as Array<unknown>).length > 0 && typeof ((data.sections as Array<Record<string, unknown>>)[0]?.questions) !== "undefined") {
      const sections = data.sections as Array<{
        heading: string;
        questions: Array<{ q: string; a: string }>;
        content?: string;
      }>;
      return (
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-bold text-lg mb-4">{s.heading}</h2>
              {s.content && <p className="text-muted-foreground text-sm">{s.content}</p>}
              {s.questions && (
                <div className="space-y-4">
                  {s.questions.map((qa, j) => (
                    <div key={j} className="rounded-xl border p-4 hover:border-teal-200 transition-colors">
                      <p className="font-semibold text-sm">{qa.q}</p>
                      <p className="text-sm text-muted-foreground mt-2">{qa.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // T&Cs / Privacy (lastUpdated + sections without questions)
    if (data.lastUpdated && data.sections) {
      const sections = data.sections as Array<{ heading: string; content: string }>;
      return (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">Last updated: {String(data.lastUpdated)}</p>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-semibold text-base mb-2">{s.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      );
    }

    // About Us
    if (data.tagline && data.values) {
      const values = data.values as Array<{ title: string; description: string }>;
      return (
        <div className="space-y-8">
          <p className="text-xl font-semibold text-teal-700">{String(data.tagline)}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="rounded-xl border p-4 hover:border-teal-200 transition-colors">
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
          {Boolean(data.team) && (
            <p className="text-sm text-muted-foreground">{String(data.team)}</p>
          )}
        </div>
      );
    }

    return <p className="text-muted-foreground">Page content</p>;
  } catch {
    return <p className="whitespace-pre-wrap text-sm text-muted-foreground">{body}</p>;
  }
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let page;
  try {
    page = await getPage(slug);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }

  const meta = SLUG_ACCENT[slug];

  return (
    <div>
      <PageHero
        title={page.title}
        subtitle={meta?.subtitle}
        accent={meta?.accent ?? "teal"}
        imageUrl={meta?.imageUrl}
        compact
      />

      <div className="container py-10 max-w-3xl mx-auto">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </nav>

        {renderBody(page.body)}
      </div>
    </div>
  );
}
