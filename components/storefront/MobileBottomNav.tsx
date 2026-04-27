"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Fish, Search, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";

type Props = { cartCount: number };

export function MobileBottomNav({ cartCount }: Props) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const tabCls = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-[3px] text-[10px] font-semibold tracking-wide transition-colors duration-200",
      active ? "text-[#0B6E6E]" : "text-[#4A7B86]",
    );

  const iconCls = (active: boolean) =>
    cn("h-[22px] w-[22px] transition-all duration-200", active && "stroke-[2.5px]");

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-area-pb"
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="grid grid-cols-5 h-[60px] px-1">

          {/* Home */}
          <Link href="/" className={tabCls(isActive("/", true))}>
            <Home className={iconCls(isActive("/", true))} />
            <span>Home</span>
          </Link>

          {/* Shop */}
          <Link href="/shop" className={tabCls(isActive("/shop"))}>
            <Fish className={iconCls(isActive("/shop"))} />
            <span>Shop</span>
          </Link>

          {/* Search — centre FAB */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center gap-[3px]"
            aria-label="Search"
          >
            <div
              className="h-12 w-12 -mt-5 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(11,110,110,0.30)]"
              style={{ background: "var(--color-primary)" }}
            >
              <Search className="h-[22px] w-[22px] text-white" />
            </div>
            <span className="text-[10px] font-semibold text-[#4A7B86] tracking-wide">Search</span>
          </button>

          {/* Account */}
          <Link href="/account/profile" className={tabCls(isActive("/account"))}>
            <User className={iconCls(isActive("/account"))} />
            <span>Account</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className={tabCls(isActive("/cart", true))}>
            <div className="relative">
              <ShoppingBag className={iconCls(isActive("/cart", true))} />
              {cartCount > 0 && (
                <span
                  className="absolute -right-2 -top-1.5 h-4 min-w-[16px] px-1 rounded-full text-white text-[9px] font-bold leading-4 text-center"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

        </div>
      </nav>
    </>
  );
}
