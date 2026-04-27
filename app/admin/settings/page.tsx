import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAllSettings } from "@/server/modules/settings/service";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div>
      <PageHeader
        title="Store settings"
        description="Configure store information, shipping, and customer-facing copy"
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
