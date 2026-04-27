import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAdminCoupons } from "@/server/modules/coupons/admin";
import { formatMoney, formatDate } from "@/lib/format";

export default async function AdminCouponsPage() {
  const coupons = await listAdminCoupons();
  return (
    <div>
      <PageHeader
        title="Coupons"
        description={`${coupons.length} ${coupons.length === 1 ? "coupon" : "coupons"}`}
        primaryAction={{ label: "Add coupon", href: "/admin/coupons/new" }}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                  <th className="px-4 py-2.5 font-medium">Min order</th>
                  <th className="px-4 py-2.5 font-medium">Used</th>
                  <th className="px-4 py-2.5 font-medium">Window</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No coupons yet.{" "}
                      <Link
                        href="/admin/coupons/new"
                        className="underline underline-offset-4"
                      >
                        Create one
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3 font-mono">
                        <Link
                          href={`/admin/coupons/${c.id}`}
                          className="font-medium hover:underline"
                        >
                          {c.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {c.type === "percentage"
                          ? `${(c.value / 100).toFixed(2)}%`
                          : formatMoney(c.value)}
                      </td>
                      <td className="px-4 py-3">
                        {c.minimumOrderCents > 0
                          ? formatMoney(c.minimumOrderCents)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.usedCount}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.startsAt ? formatDate(c.startsAt) : "—"} →{" "}
                        {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                      </td>
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
