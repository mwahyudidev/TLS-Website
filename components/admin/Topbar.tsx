"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminTopbar({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const router = useRouter();
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-5">
      <div className="text-sm text-muted-foreground">
        Welcome, <span className="text-foreground font-medium">{user.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" target="_blank">
            <ExternalLink className="h-3.5 w-3.5" /> View store
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/account/login");
            router.refresh();
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    </header>
  );
}
