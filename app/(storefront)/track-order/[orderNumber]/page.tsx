import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackOrderForm } from "@/components/storefront/TrackOrderForm";
import { TrackingDetail } from "@/components/shared/TrackingDetail";
import { getTrackingPayload } from "@/server/modules/tracking/service";
import { getCurrentUser } from "@/server/lib/session";
import { AppError } from "@/server/lib/errors";

export default async function TrackOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const email = sp.email;

  if (!email) {
    return (
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Track {orderNumber}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the email used at checkout to view this order.
        </p>
        <Card>
          <CardContent className="pt-6">
            <TrackOrderForm defaultOrderNumber={orderNumber} />
          </CardContent>
        </Card>
      </div>
    );
  }

  let data;
  try {
    data = await getTrackingPayload(orderNumber, email);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") {
      return (
        <div className="container py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" /> Order not found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We couldn't find an order matching that number and email.
                Please double-check both — they must match what was used at
                checkout.
              </p>
              <TrackOrderForm
                defaultOrderNumber={orderNumber}
                defaultEmail={email}
              />
            </CardContent>
          </Card>
        </div>
      );
    }
    throw e;
  }

  const user = await getCurrentUser();
  const showAccountCta =
    !!user && user.email.toLowerCase() === data.customerEmail.toLowerCase();

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tracking
        </h1>
        <Button asChild variant="ghost" size="sm">
          <Link href="/track-order">Track another order</Link>
        </Button>
      </div>
      <TrackingDetail data={data} showLoggedInCta={showAccountCta} />
    </div>
  );
}
