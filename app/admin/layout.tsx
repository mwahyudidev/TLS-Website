import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminTopbar } from "@/components/admin/Topbar";
import { getCurrentUser } from "@/server/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  if (!["super_admin", "admin", "staff"].includes(user.role)) {
    redirect("/account/profile");
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar user={user} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
