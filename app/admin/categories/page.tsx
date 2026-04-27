import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAdminCategories } from "@/server/modules/categories/admin";

export default async function AdminCategoriesPage() {
  const cats = await listAdminCategories();
  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${cats.length} ${cats.length === 1 ? "category" : "categories"}`}
        primaryAction={{ label: "Add category", href: "/admin/categories/new" }}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Slug</th>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {cats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      No categories yet.{" "}
                      <Link
                        href="/admin/categories/new"
                        className="underline underline-offset-4"
                      >
                        Create one
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  cats.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="font-medium hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3">{c.sortOrder}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={c.status === "active" ? "success" : "muted"}
                          className="text-[10px]"
                        >
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
