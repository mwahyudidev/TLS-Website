import { requireAdmin } from "@/server/lib/session";
import { listSubscribers } from "@/server/modules/newsletter/service";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDateTime } from "@/lib/format";

export default async function AdminNewsletterPage() {
  await requireAdmin();
  const subscribers = await listSubscribers();
  const active = subscribers.filter((s) => s.status === "active").length;

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        description={`${active} active subscriber${active !== 1 ? "s" : ""}`}
      />
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No subscribers yet.</td>
              </tr>
            ) : (
              subscribers.slice().reverse().map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateTime(s.subscribedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
