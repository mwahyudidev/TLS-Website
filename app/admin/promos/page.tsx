import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/server/lib/session";
import { listAdminPromos } from "@/server/modules/promos/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminPromosPage() {
  await requireAdmin();
  const promos = await listAdminPromos();

  return (
    <div>
      <PageHeader
        title="Weekly Promos"
        description="Manage promotional campaigns"
        action={
          <Link href="/admin/promos/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Promo
            </Button>
          </Link>
        }
      />

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Valid Period</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {promos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No promos yet. <Link href="/admin/promos/new" className="text-primary underline">Create one</Link>.
                </td>
              </tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.validFrom)} – {formatDate(p.validUntil)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/promos/${p.id}`} className="text-xs text-primary hover:underline">
                      Edit
                    </Link>
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
