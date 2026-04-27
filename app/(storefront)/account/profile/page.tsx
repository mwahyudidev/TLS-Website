import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/storefront/AuthForms";
import { getCurrentUser } from "@/server/lib/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">My account</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone ?? "—"} />
            <Row label="Role" value={user.role} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/account/orders">My orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/track-order">Track an order</Link>
            </Button>
            {user.role !== "customer" && (
              <Button asChild>
                <Link href="/admin">Admin dashboard</Link>
              </Button>
            )}
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
