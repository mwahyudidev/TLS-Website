import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/lib/session";
import { AuthPage } from "@/components/storefront/AuthPage";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "customer" ? "/account/profile" : "/admin");
  return <AuthPage initialMode="login" />;
}
