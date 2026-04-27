import { requireAdmin } from "@/server/lib/session";
import { listAllSocialLinks } from "@/server/modules/social/service";
import { PageHeader } from "@/components/admin/PageHeader";
import { IntegrationsForm } from "@/components/admin/IntegrationsForm";

export default async function AdminIntegrationsPage() {
  await requireAdmin();
  const links = await listAllSocialLinks();

  return (
    <div>
      <PageHeader title="Integrations & Social" description="Manage WhatsApp link and social media URLs" />
      <IntegrationsForm links={links} />
    </div>
  );
}
