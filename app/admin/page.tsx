import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  getRecentPayments,
} from "@/server/modules/dashboard/service";
import { formatMoney, formatDateTime } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStock, recentPayments] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(8),
    getLowStockProducts(8),
    getRecentPayments(8),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Simulated sales summary and recent activity
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Simulated total sales"
          value={formatMoney(stats.totalSalesCents)}
          hint="Sum of all paid orders"
          accent="success"
        />
        <StatCard label="Total orders" value={stats.totalOrders} />
        <StatCard
          label="Pending orders"
          value={stats.pendingOrders}
          accent="warning"
        />
        <StatCard
          label="Paid orders"
          value={stats.paidOrders}
          accent="info"
        />
        <StatCard label="Shipped" value={stats.shippedOrders} />
        <StatCard label="Completed" value={stats.completedOrders} />
        <StatCard label="Active products" value={stats.activeProducts} />
        <StatCard label="Customers" value={stats.totalCustomers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="divide-y">
                {recentOrders.map((o) => (
                  <li key={o.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.customerName} · {formatDateTime(o.createdAt)}
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
            <div className="mt-3">
              <Link
                href="/admin/orders"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                View all orders →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low stock alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All products are in healthy stock.
              </p>
            ) : (
              <ul className="divide-y">
                {lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        SKU {p.sku}
                      </span>
                      <span
                        className={`text-sm font-semibold ${p.stock === 0 ? "text-destructive" : "text-amber-700"}`}
                      >
                        {p.stock}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <ul className="divide-y">
                {recentPayments.map((p) => (
                  <li
                    key={p.id}
                    className="py-3 flex items-center gap-3 justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/orders/${p.orderId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {p.orderNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.paymentMethod} · {p.transactionReference}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.paymentStatus} />
                      <span className="text-sm font-semibold w-20 text-right">
                        {formatMoney(p.amountCents)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
