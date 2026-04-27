import Link from "next/link";
import { requireAdmin } from "@/server/lib/session";
import { listAdminPages } from "@/server/modules/content/admin";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminContentPage() {
  await requireAdmin();
  const pages = await listAdminPages();

  return (
    <div>
      <PageHeader title="Content Pages" description="Manage static CMS pages" />
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">/pages/{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex gap-3 justify-end">
                  <Link href={`/pages/${p.slug}`} target="_blank" className="text-xs text-muted-foreground hover:text-foreground">View</Link>
                  <Link href={`/admin/content/${p.id}`} className="text-xs text-primary hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
