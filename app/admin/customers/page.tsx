import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAdminCustomers } from "@/server/modules/customers/admin";
import { formatMoney, formatDate } from "@/lib/format";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { data: customers, meta } = await listAdminCustomers({
    q: sp.q,
    page: Number(sp.page ?? "1") || 1,
    perPage: 25,
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${meta.total} ${meta.total === 1 ? "customer" : "customers"}`}
      />

      <form action="/admin/customers" method="get" className="mb-4 flex items-center gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name or email"
          className="h-9 w-72 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">
          Search
        </button>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium">Orders</th>
                  <th className="px-4 py-2.5 font-medium">Total spent</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-medium hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">{c.orderCount}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(c.totalSpentCents)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
