import { requireAdmin } from "@/server/lib/session";
import { listAvailabilitySubscriptions } from "@/server/modules/availability-subscriptions/service";
import { PageHeader } from "@/components/admin/PageHeader";
import { AvailabilitySubsTable } from "./AvailabilitySubsTable";

export default async function AdminAvailabilitySubscriptionsPage() {
  await requireAdmin();
  const records = await listAvailabilitySubscriptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability Subscriptions"
        description="Customers who signed up to be notified when products become available"
      />
      <AvailabilitySubsTable records={records} />
    </div>
  );
}
