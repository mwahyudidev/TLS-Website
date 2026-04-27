import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { listHeroSlides } from "@/server/modules/hero-slides/service";

export default async function HeroSlidesPage() {
  const slides = await listHeroSlides();

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Manage the homepage hero carousel slides."
        primaryAction={{ label: "Add Slide", href: "/admin/hero-slides/new" }}
      />

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">CTA</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {slides.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hero slides yet. Add your first slide.
                </td>
              </tr>
            )}
            {slides.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{s.sortOrder}</td>
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs px-2 py-0.5 capitalize">
                    {s.slideType}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.ctaLabel ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full text-xs px-2 py-0.5 font-medium ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/hero-slides/${s.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
