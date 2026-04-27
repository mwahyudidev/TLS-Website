import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getCurrentUser } from "@/server/lib/session";
import { getOrdersByUser } from "@/server/modules/orders/service";
import { formatMoney, formatDate } from "@/lib/format";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const orders = await getOrdersByUser(user.id);

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">My orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once you place an order it will appear here.
            </p>
            <Button asChild className="mt-5">
              <Link href="/products">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-5 flex flex-wrap items-center gap-4 justify-between">
                <div className="space-y-1">
                  <Link
                    href={`/account/orders/${o.orderNumber}`}
                    className="font-medium hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)} · {o.itemCount}{" "}
                    {o.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={o.orderStatus} />
                  <StatusBadge status={o.paymentStatus} />
                  <span className="text-sm font-semibold ml-3">
                    {formatMoney(o.grandTotalCents)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
