import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  listAdminOrders,
} from "@/server/modules/orders/admin";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/db/schema";
import { formatMoney, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    payment?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const status = sp.status as (typeof ORDER_STATUSES)[number] | undefined;
  const payment = sp.payment as (typeof PAYMENT_STATUSES)[number] | undefined;

  const { data: orders, meta } = await listAdminOrders({
    status,
    payment,
    q: sp.q,
    page: Number(sp.page ?? "1") || 1,
    perPage: 25,
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${meta.total} ${meta.total === 1 ? "order" : "orders"}`}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form action="/admin/orders" method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Order #, name, or email"
            className="h-9 w-72 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {status && <input type="hidden" name="status" value={status} />}
          {payment && <input type="hidden" name="payment" value={payment} />}
          <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">
            Search
          </button>
        </form>
        <FilterChip label="All" href="/admin/orders" active={!status && !payment} />
        {ORDER_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={s}
            href={`/admin/orders?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No orders match these filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(o.grandTotalCents)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.orderStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.paymentStatus} />
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
              href={`/admin/orders?page=${p}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}${status ? `&status=${status}` : ""}${payment ? `&payment=${payment}` : ""}`}
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

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "h-7 px-2.5 inline-flex items-center text-xs rounded-full border capitalize",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:bg-accent text-muted-foreground",
      )}
    >
      {label}
    </Link>
  );
}
