import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { payments, orders } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatMoney, formatDateTime } from "@/lib/format";

export default async function AdminPaymentsPage() {
  const rows = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      orderNumber: orders.orderNumber,
      paymentMethod: payments.paymentMethod,
      paymentProvider: payments.paymentProvider,
      paymentStatus: payments.paymentStatus,
      transactionReference: payments.transactionReference,
      amountCents: payments.amountCents,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .orderBy(desc(payments.createdAt))
    .limit(100)
    .all();

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Most recent simulated payments. Open the order to manage."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Method</th>
                  <th className="px-4 py-2.5 font-medium">Reference</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          href={`/admin/orders/${p.orderId}`}
                          className="font-medium hover:underline"
                        >
                          {p.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{p.paymentMethod}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {p.transactionReference}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(p.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(p.createdAt)}
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
