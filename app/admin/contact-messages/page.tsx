import { requireAdmin } from "@/server/lib/session";
import { listContactMessages } from "@/server/modules/contact/service";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDateTime } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-muted text-muted-foreground",
  replied: "bg-green-100 text-green-700",
  archived: "bg-muted text-muted-foreground",
};

export default async function ContactMessagesPage() {
  await requireAdmin();
  const messages = await listContactMessages();
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        description={unread > 0 ? `${unread} new message${unread > 1 ? "s" : ""}` : "All messages read"}
      />
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">From</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No messages yet.</td>
              </tr>
            ) : (
              messages.slice().reverse().map((m) => (
                <tr key={m.id} className={`hover:bg-muted/30 ${m.status === "new" ? "font-medium" : ""}`}>
                  <td className="px-4 py-3">
                    <div>{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate">{m.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.message.slice(0, 60)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[m.status] ?? ""}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDateTime(m.createdAt)}
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
