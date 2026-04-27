import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAdminProducts } from "@/server/modules/products/admin";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as "draft" | "active" | "archived" | undefined;
  const { data: products, meta } = await listAdminProducts({
    q: sp.q,
    status,
    page: Number(sp.page ?? "1") || 1,
    perPage: 25,
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${meta.total} ${meta.total === 1 ? "product" : "products"}`}
        primaryAction={{ label: "Add product", href: "/admin/products/new" }}
      />

      <div className="flex items-center gap-4 mb-4 text-sm">
        <form action="/admin/products" method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by name or SKU"
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {status && <input type="hidden" name="status" value={status} />}
          <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">
            Search
          </button>
        </form>
        <div className="flex items-center gap-1 ml-auto">
          {(["all", "active", "draft", "archived"] as const).map((s) => {
            const href = s === "all" ? "/admin/products" : `/admin/products?status=${s}`;
            const active = (status ?? "all") === s;
            return (
              <Link
                key={s}
                href={href}
                className={cn(
                  "h-8 px-3 inline-flex items-center text-sm rounded-md",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">SKU</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Stock</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No products found.{" "}
                      <Link
                        href="/admin/products/new"
                        className="underline underline-offset-4"
                      >
                        Create your first
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                        {p.featured && (
                          <Badge variant="info" className="ml-2 text-[10px]">
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3">
                        {formatMoney(p.priceCents)}
                        {p.compareAtPriceCents && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">
                            {formatMoney(p.compareAtPriceCents)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            p.stock === 0 && "text-destructive font-medium",
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            p.status === "active"
                              ? "success"
                              : p.status === "draft"
                                ? "muted"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
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

      {meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}${status ? `&status=${status}` : ""}`}
              className={cn(
                "h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-md border",
                p === meta.page && "bg-primary text-primary-foreground border-primary",
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
