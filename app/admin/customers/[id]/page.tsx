import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getAdminCustomer } from "@/server/modules/customers/admin";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { AppError } from "@/server/lib/errors";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cid = Number(id);
  if (!Number.isInteger(cid)) notFound();

  let detail;
  try {
    detail = await getAdminCustomer(cid);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const { customer, orders } = detail;

  const totalSpentCents = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.grandTotalCents, 0);

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.email}
        back={{ label: "Back to customers", href: "/admin/customers" }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order history</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This customer has no orders yet.
              </p>
            ) : (
              <ul className="divide-y">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="py-3 flex items-center gap-3 justify-between"
                  >
                    <div>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={o.orderStatus} />
                      <StatusBadge status={o.paymentStatus} />
                      <span className="text-sm font-semibold w-20 text-right">
                        {formatMoney(o.grandTotalCents)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row label="Name" value={customer.name} />
              <Row label="Email" value={customer.email} />
              <Row label="Phone" value={customer.phone ?? "—"} />
              <Row label="Joined" value={formatDate(customer.createdAt)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row label="Total orders" value={String(orders.length)} />
              <Row label="Lifetime spend" value={formatMoney(totalSpentCents)} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
