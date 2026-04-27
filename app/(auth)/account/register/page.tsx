import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/lib/session";
import { AuthPage } from "@/components/storefront/AuthPage";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account/profile");
  return <AuthPage initialMode="register" />;
}
