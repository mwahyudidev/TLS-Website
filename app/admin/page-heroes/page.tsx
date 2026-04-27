import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { listPageHeroes } from "@/server/modules/page-heroes/service";

const PAGE_KEYS = [
  { key: "shop",                  label: "Shop" },
  { key: "subscriptions",         label: "Subscriptions" },
  { key: "recipes",               label: "Recipes" },
  { key: "contact",               label: "Contact Us" },
  { key: "track-order",           label: "Track Order" },
  { key: "pages-our-story",       label: "Our Story" },
  { key: "pages-about",           label: "About Us" },
  { key: "pages-faq",             label: "FAQs" },
  { key: "pages-terms",           label: "Terms & Conditions" },
  { key: "pages-privacy",         label: "Privacy Policy" },
];

export default async function PageHeroesAdminPage() {
  const heroes = await listPageHeroes();
  const heroMap = Object.fromEntries(heroes.map((h) => [h.pageKey, h]));

  return (
    <div>
      <PageHeader
        title="Page Heroes"
        description="Override hero banner content per page. Pages without a custom hero use the default gradient."
      />

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Page</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Has Image</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {PAGE_KEYS.map(({ key, label }) => {
              const hero = heroMap[key];
              return (
                <tr key={key} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{hero?.title ?? <span className="text-muted-foreground/50 italic">Default</span>}</td>
                  <td className="px-4 py-3">
                    {hero?.imageUrl ? (
                      <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5">Yes</span>
                    ) : (
                      <span className="inline-block rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5">Gradient</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {hero ? (
                      <span className={`inline-block rounded-full text-xs px-2 py-0.5 font-medium ${hero.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {hero.status}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/page-heroes/${hero?.id ?? "new"}?pageKey=${key}&label=${encodeURIComponent(label)}`}>
                        {hero ? "Edit" : "Configure"}
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
