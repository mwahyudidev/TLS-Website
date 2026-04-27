"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  CreditCard,
  Truck,
  Ticket,
  Settings,
  Megaphone,
  Bell,
  ChefHat,
  FileText,
  MessageSquare,
  Mail,
  Share2,
  SlidersHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CORE = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/shipments", label: "Shipments", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
];

const CONTENT = [
  { href: "/admin/hero-slides", label: "Hero Slides", icon: SlidersHorizontal },
  { href: "/admin/page-heroes", label: "Page Heroes", icon: ImageIcon },
  { href: "/admin/promos", label: "Weekly Promos", icon: Megaphone },
  { href: "/admin/availability-subscriptions", label: "Notify Me Requests", icon: Bell },
  { href: "/admin/recipes", label: "Recipes", icon: ChefHat },
  { href: "/admin/content", label: "Content Pages", icon: FileText },
  { href: "/admin/contact-messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/integrations", label: "Integrations", icon: Share2 },
];

const SYSTEM = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof CORE;
  pathname: string;
}) {
  return (
    <div>
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </div>
      {items.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname === it.href || pathname.startsWith(it.href + "/");
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="h-16 px-4 flex items-center justify-between border-b">
        <Link href="/admin" aria-label="The Line Seafood Admin">
          <Image
            src="/brand/logo-main.svg"
            alt="The Line Seafood"
            width={120}
            height={33}
            className="h-8 w-auto"
          />
        </Link>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 ml-2">Admin</span>
      </div>
      <nav className="p-2 flex-1 space-y-3 overflow-y-auto">
        <NavGroup label="Store" items={CORE} pathname={pathname} />
        <NavGroup label="Content & Marketing" items={CONTENT} pathname={pathname} />
        <NavGroup label="System" items={SYSTEM} pathname={pathname} />
      </nav>
      <div className="p-3 border-t text-[11px] text-muted-foreground">
        The Line Seafood · Admin
      </div>
    </aside>
  );
}
