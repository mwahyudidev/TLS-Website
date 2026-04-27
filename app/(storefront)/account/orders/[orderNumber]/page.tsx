import { notFound, redirect } from "next/navigation";
import { TrackingDetail } from "@/components/shared/TrackingDetail";
import { getCurrentUser } from "@/server/lib/session";
import { getOrderForUser } from "@/server/modules/orders/service";
import { getTrackingPayload } from "@/server/modules/tracking/service";
import { AppError } from "@/server/lib/errors";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const { orderNumber } = await params;
  try {
    // Verify ownership
    await getOrderForUser(orderNumber, user.id);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }

  // Reuse tracking payload (sanitized) for the same UI as public track
  const data = await getTrackingPayload(orderNumber, user.email);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Order {data.orderNumber}
      </h1>
      <TrackingDetail data={data} />
    </div>
  );
}
