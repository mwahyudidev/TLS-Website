import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { shipments, orders } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function AdminShipmentsPage() {
  const rows = await db
    .select({
      id: shipments.id,
      orderId: shipments.orderId,
      orderNumber: orders.orderNumber,
      courierName: shipments.courierName,
      trackingNumber: shipments.trackingNumber,
      shippingStatus: shipments.shippingStatus,
      estimatedDelivery: shipments.estimatedDelivery,
      shippedAt: shipments.shippedAt,
      createdAt: shipments.createdAt,
    })
    .from(shipments)
    .innerJoin(orders, eq(orders.id, shipments.orderId))
    .orderBy(desc(shipments.createdAt))
    .limit(100)
    .all();

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Open the order to manage shipment details and status."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Courier</th>
                  <th className="px-4 py-2.5 font-medium">Tracking #</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">ETA</th>
                  <th className="px-4 py-2.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No shipments yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          href={`/admin/orders/${s.orderId}`}
                          className="font-medium hover:underline"
                        >
                          {s.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{s.courierName ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {s.trackingNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.shippingStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {s.estimatedDelivery ? formatDate(s.estimatedDelivery) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(s.createdAt)}
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
