"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  Search,
  MessageCircle,
  Fish,
  Info,
  BookOpen,
  HelpCircle,
  FileText,
  Shield,
  Phone,
  LogIn,
  UserPlus,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";

/* ─── mega menu column config (heading + navGroup key) ──
   These three columns are fixed; categories are fetched from DB.
   Admins control which column a category appears in by setting
   its navGroup to "live", "fresh-frozen", or "special".
─────────────────────────────────────────────────────────── */
const COLUMN_CONFIG = [
  { heading: "Live Seafood",  group: "live",         shopAll: { label: "Shop all live →",        href: "/shop?group=live"         } },
  { heading: "Fresh & Frozen",group: "fresh-frozen", shopAll: { label: "View fresh & frozen →",  href: "/shop?group=fresh-frozen" } },
  { heading: "Special Packs", group: "special",      shopAll: { label: "All special packs →",    href: "/shop?group=special"      } },
] as const;

const MEGA_IMAGE_CARDS = [
  {
    label: "New Arrivals",
    href: "/shop?sort=newest",
    imageUrl:
      "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=90&auto=format&fit=crop",
  },
  {
    label: "Best Sellers",
    href: "/shop?sort=popular",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=90&auto=format&fit=crop",
  },
];

const INFO_ITEMS = [
  { label: "Our Story",          href: "/pages/our-story",            Icon: BookOpen   },
  { label: "About Us",           href: "/pages/about",                Icon: Info       },
  { label: "FAQs",               href: "/pages/faq",                  Icon: HelpCircle },
  { label: "Terms & Conditions", href: "/pages/terms-and-conditions", Icon: FileText   },
  { label: "Privacy Policy",     href: "/pages/privacy-policy",       Icon: Shield     },
  { label: "Contact Us",         href: "/contact",                    Icon: Phone      },
];

const MID_LINKS = [
  { label: "Recipes",   href: "/recipes"       },
  { label: "Notify Me", href: "/subscriptions" },
];

/* ─── types ─────────────────────────────────────────── */
type MenuKey = "shop" | "info" | "user" | "mobile" | null;

type NavCategory = { id: number; name: string; slug: string; navGroup: string | null };

type Props = {
  storeName?: string;
  cartCount: number;
  isLoggedIn: boolean;
  categories?: NavCategory[];
};

/* ─── component ─────────────────────────────────────── */
type CartLine = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  lineSubtotalCents: number;
};

export function NavShell({ cartCount, isLoggedIn, categories = [] }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<MenuKey>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const cartCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(null);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open === "mobile" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const openMenu = useCallback((key: "shop" | "info" | "user") => {
    if (closeRef.current) clearTimeout(closeRef.current);
    if (cartCloseRef.current) clearTimeout(cartCloseRef.current);
    setCartOpen(false);
    setOpen(key);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeRef.current) clearTimeout(closeRef.current);
    closeRef.current = setTimeout(() => {
      setOpen((prev) => (prev === "mobile" ? prev : null));
      closeRef.current = null;
    }, 140);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeRef.current) {
      clearTimeout(closeRef.current);
      closeRef.current = null;
    }
  }, []);

  const openCart = useCallback(async () => {
    if (cartCloseRef.current) clearTimeout(cartCloseRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
    setOpen((prev) => (prev === "mobile" ? prev : null));
    setCartOpen(true);
    setCartLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const json = await res.json();
        setCartLines(json.data?.lines ?? []);
        setCartSubtotal(json.data?.subtotalCents ?? 0);
      }
    } finally {
      setCartLoading(false);
    }
  }, []);

  const scheduleCartClose = useCallback(() => {
    if (cartCloseRef.current) clearTimeout(cartCloseRef.current);
    cartCloseRef.current = setTimeout(() => {
      setCartOpen(false);
      cartCloseRef.current = null;
    }, 140);
  }, []);

  const cancelCartClose = useCallback(() => {
    if (cartCloseRef.current) {
      clearTimeout(cartCloseRef.current);
      cartCloseRef.current = null;
    }
  }, []);

  const closeDesktopFlyouts = useCallback(() => {
    cancelClose();
    cancelCartClose();
    setOpen((prev) => (prev === "mobile" ? prev : null));
    setCartOpen(false);
  }, [cancelCartClose, cancelClose]);

  const handleSignOut = useCallback(async () => {
    closeDesktopFlyouts();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/account/login");
      router.refresh();
    }
  }, [closeDesktopFlyouts, router]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const triggerCls = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 text-[13px] font-medium transition-colors duration-150 px-2 py-1.5 rounded-md",
      active ? "text-[#0B6E6E]" : "text-[#4A7B86] hover:text-[#0B6E6E]",
    );

  const linkCls = (href: string) =>
    cn(
      "inline-flex items-center text-[13px] font-medium transition-colors duration-150 px-2 py-1.5 rounded-md",
      isActive(href) ? "text-[#0B6E6E]" : "text-[#4A7B86] hover:text-[#0B6E6E]",
    );

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white shadow-[0_1px_16px_rgba(11,110,110,0.10)] border-b border-[#D0EBEB]"
            : "bg-white/92 backdrop-blur border-b border-[#D0EBEB]/60",
        )}
        onMouseLeave={() => { scheduleClose(); scheduleCartClose(); }}
      >
        {/* ── Main bar ── */}
        <div className="relative container flex h-[68px] items-center">

          {/* ── LEFT: desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">

            {/* Shop — link text + chevron trigger */}
            <div
              className="flex items-center"
              onMouseEnter={() => openMenu("shop")}
            >
              <Link
                href="/shop"
                className={cn(
                  "text-[13px] font-medium transition-colors duration-150 px-2 py-1.5 rounded-l-md",
                  isActive("/shop") || open === "shop"
                    ? "text-[#0B6E6E]"
                    : "text-[#4A7B86] hover:text-[#0B6E6E]",
                )}
              >
                Shop
              </Link>
              <button
                aria-label="Shop categories"
                className={cn(
                  "px-1 py-1.5 rounded-r-md transition-colors duration-150",
                  open === "shop"
                    ? "text-[#0B6E6E]"
                    : "text-[#4A7B86] hover:text-[#0B6E6E]",
                )}
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open === "shop" ? "rotate-180" : "")} />
              </button>
            </div>

            {MID_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={linkCls(href)}
                onMouseEnter={closeDesktopFlyouts}
              >
                {label}
              </Link>
            ))}

            {/* Information dropdown */}
            <div className="relative" onMouseEnter={() => openMenu("info")}>
              <button className={triggerCls(
                open === "info" ||
                pathname.startsWith("/pages") ||
                pathname === "/contact",
              )}>
                Information
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open === "info" ? "rotate-180" : "")} />
              </button>

              <div
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-[#D0EBEB] shadow-[0_8px_24px_rgba(11,110,110,0.12)] overflow-hidden transition-all duration-200 ease-out",
                  open === "info"
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none",
                )}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <div className="py-2">
                  {INFO_ITEMS.map(({ label, href, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors duration-150"
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#0E9E9E]" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* ── CENTER: logo ── */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex-shrink-0"
            aria-label="The Line Seafood — Home"
            onMouseEnter={closeDesktopFlyouts}
          >
            <Image
              src="/brand/logo-main.svg"
              alt="The Line Seafood"
              width={156}
              height={44}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* ── RIGHT: action icons ── */}
          <div
            className="hidden lg:flex items-center gap-1 flex-1 justify-end"
            onMouseEnter={() => { cancelClose(); cancelCartClose(); }}
          >

            {/* Search */}
            <button
              aria-label="Search"
              onMouseEnter={closeDesktopFlyouts}
              onClick={() => {
                closeDesktopFlyouts();
                setSearchOpen(true);
              }}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* User icon with hover dropdown */}
            <div className="relative" onMouseEnter={() => openMenu("user")}>
              <button
                type="button"
                aria-label={isLoggedIn ? "My account" : "Sign in"}
                aria-haspopup="menu"
                aria-expanded={open === "user"}
                onClick={() => {
                  if (open === "user") {
                    setOpen(null);
                  } else {
                    openMenu("user");
                  }
                }}
                className={cn(
                  "h-9 w-9 inline-flex items-center justify-center rounded-md text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors",
                  open === "user" && "text-[#0B6E6E] bg-[#E6F7F7]",
                )}
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              {/* User dropdown — pt-2 bridge closes the gap so mouseleave never fires mid-traversal */}
              <div
                className={cn(
                  "absolute top-full right-0 pt-2 z-50",
                  open === "user" ? "pointer-events-auto" : "pointer-events-none",
                )}
                onMouseLeave={scheduleClose}
              >
              <div
                className={cn(
                  "w-52 bg-white rounded-xl border border-[#D0EBEB] shadow-[0_8px_24px_rgba(11,110,110,0.12)] overflow-hidden transition-all duration-200 ease-out",
                  open === "user"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1",
                )}
              >
                {isLoggedIn ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0E9E9E]">
                      My Account
                    </div>
                    <Link href="/account/profile" onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors">
                      <User className="h-3.5 w-3.5 text-[#0E9E9E]" /> My Profile
                    </Link>
                    <Link href="/account/orders" onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors">
                      <ClipboardList className="h-3.5 w-3.5 text-[#0E9E9E]" /> My Orders
                    </Link>
                    <div className="mx-4 my-1 border-t border-[#D0EBEB]" />
                    <button type="button" onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0E9E9E]">
                      Account
                    </div>
                    <Link href="/account/login" onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors">
                      <LogIn className="h-3.5 w-3.5 text-[#0E9E9E]" /> Sign In
                    </Link>
                    <Link href="/account/register" onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors">
                      <UserPlus className="h-3.5 w-3.5 text-[#0E9E9E]" /> Create Account
                    </Link>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Cart with hover dropdown */}
            <div
              className="relative"
              onMouseEnter={openCart}
            >
              <button
                type="button"
                aria-label="Cart"
                aria-haspopup="menu"
                aria-expanded={cartOpen}
                onClick={() => {
                  if (cartOpen) {
                    setCartOpen(false);
                  } else {
                    void openCart();
                  }
                }}
                className={cn(
                  "relative h-9 w-9 inline-flex items-center justify-center rounded-md transition-colors",
                  cartOpen ? "text-[#0B6E6E] bg-[#E6F7F7]" : "text-[#4A7B86] hover:text-[#0B6E6E] hover:bg-[#E6F7F7]",
                )}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex items-center justify-center rounded-full bg-[#0B6E6E] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Cart dropdown — pt-2 bridge closes the gap */}
              <div
                className={cn(
                  "absolute top-full right-0 pt-2 z-50",
                  cartOpen ? "pointer-events-auto" : "pointer-events-none",
                )}
                onMouseLeave={scheduleCartClose}
              >
              <div
                className={cn(
                  "w-80 bg-white rounded-xl border border-[#D0EBEB] shadow-[0_8px_24px_rgba(11,110,110,0.14)] overflow-hidden transition-all duration-200 ease-out",
                  cartOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
                )}
              >
                <div className="px-4 py-3 border-b border-[#D0EBEB] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#0E9E9E]">Cart</span>
                  {cartLines.length > 0 && (
                    <span className="text-[11px] text-[#4A7B86]">{cartLines.reduce((s, l) => s + l.quantity, 0)} item{cartLines.reduce((s, l) => s + l.quantity, 0) !== 1 ? "s" : ""}</span>
                  )}
                </div>

                {cartLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block h-5 w-5 rounded-full border-2 border-[#0E9E9E] border-t-transparent animate-spin" />
                  </div>
                ) : cartLines.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-[#0E9E9E]/30" />
                    <p className="text-[13px] text-[#4A7B86]">Your cart is empty</p>
                    <Link href="/shop" onClick={() => setCartOpen(false)}
                      className="mt-3 inline-block text-[12px] font-semibold text-[#0B6E6E] hover:underline">
                      Browse products →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto divide-y divide-[#D0EBEB]/60">
                      {cartLines.map((line) => (
                        <Link
                          key={line.id}
                          href={`/products/${line.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#E6F7F7]/50 transition-colors"
                        >
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#E6F7F7] flex-shrink-0">
                            {line.imageUrl ? (
                              <Image src={line.imageUrl} alt={line.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Fish className="h-5 w-5 text-[#0E9E9E]/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-[#083D4F] truncate">{line.name}</p>
                            <p className="text-[11px] text-[#4A7B86] mt-0.5">
                              ×{line.quantity} · <span className="font-semibold text-[#083D4F]">S${(line.lineSubtotalCents / 100).toFixed(2)}</span>
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#D0EBEB] px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-[#4A7B86] font-medium">Subtotal</span>
                        <span className="text-[14px] font-bold text-[#083D4F]">S${(cartSubtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/cart" onClick={() => setCartOpen(false)}
                          className="text-center py-2 rounded-lg border border-[#0B6E6E] text-[#0B6E6E] text-[12px] font-semibold hover:bg-[#E6F7F7] transition-colors">
                          View Cart
                        </Link>
                        <Link href="/checkout" onClick={() => setCartOpen(false)}
                          className="text-center py-2 rounded-lg bg-[#0B6E6E] text-white text-[12px] font-semibold hover:bg-[#095858] transition-colors">
                          Checkout
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: cart + hamburger (search lives in bottom nav) ── */}
          <div className="lg:hidden flex items-center gap-1 flex-1 justify-end">
            <Link href="/cart" aria-label="Cart"
              className="relative h-9 w-9 inline-flex items-center justify-center rounded-md text-[#4A7B86]">
              <ShoppingBag className="h-[20px] w-[20px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex items-center justify-center rounded-full bg-[#0B6E6E] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <button
              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-[#4A7B86] hover:bg-[#E6F7F7] transition-colors"
              onClick={() => setOpen((p) => (p === "mobile" ? null : "mobile"))}
              aria-label="Open menu"
            >
              {open === "mobile" ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            SHOP MEGA MENU (desktop, full-width)
        ════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-white border-b border-[#D0EBEB] shadow-[0_12px_32px_rgba(11,110,110,0.10)] overflow-hidden transition-all duration-300 ease-in-out hidden lg:block",
            open === "shop"
              ? "max-h-[480px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          )}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="container py-8">
            <div className="grid grid-cols-5 divide-x divide-[#D0EBEB]">

              {COLUMN_CONFIG.map((col) => {
                const items = categories.filter((c) => c.navGroup === col.group);
                return (
                  <div key={col.heading} className="px-6 first:pl-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0E9E9E] mb-4">
                      {col.heading}
                    </p>
                    <ul className="space-y-2">
                      {items.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/shop/${cat.slug}`}
                            onClick={() => setOpen(null)}
                            className="text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] transition-colors duration-150 leading-snug"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={col.shopAll.href}
                      onClick={() => setOpen(null)}
                      className="inline-block mt-4 text-[12px] font-semibold text-[#0B6E6E] hover:text-[#0E9E9E] transition-colors"
                    >
                      {col.shopAll.label}
                    </Link>
                  </div>
                );
              })}

              {MEGA_IMAGE_CARDS.map((card) => (
                <div key={card.href} className="pl-6">
                  <Link
                    href={card.href}
                    onClick={() => setOpen(null)}
                    className="group block relative rounded-xl overflow-hidden aspect-[4/5]"
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.label}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#083D4F]/70 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 group-hover:bg-[#0B6E6E] group-hover:text-white text-[#0D2B35] text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors duration-200">
                      {card.label}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            MOBILE DRAWER
        ════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-[68px] z-50 bg-white overflow-y-auto transition-all duration-300 ease-in-out",
            open === "mobile"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full pointer-events-none",
          )}
        >
          <div className="px-4 pt-2 pb-10 space-y-0.5">

            {/* Shop accordion */}
            <div>
              <button
                onClick={() => setMobileShopOpen((p) => !p)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Fish className="h-4 w-4 text-[#0B6E6E]" /> Shop
                </span>
                <ChevronDown className={cn("h-4 w-4 text-[#4A7B86] transition-transform duration-200", mobileShopOpen ? "rotate-180" : "")} />
              </button>

              <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", mobileShopOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="mt-1 ml-4 border-l border-[#D0EBEB] pl-4 pb-2 space-y-3">
                  {COLUMN_CONFIG.map((col) => {
                    const items = categories.filter((c) => c.navGroup === col.group);
                    return (
                      <div key={col.heading}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0E9E9E] mb-1.5">{col.heading}</p>
                        {items.map((cat) => (
                          <Link key={cat.slug} href={`/shop/${cat.slug}`} onClick={() => setOpen(null)}
                            className="block py-1.5 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] transition-colors">
                            {cat.name}
                          </Link>
                        ))}
                        <Link href={col.shopAll.href} onClick={() => setOpen(null)}
                          className="block pt-1 text-[12px] font-semibold text-[#0B6E6E]">
                          {col.shopAll.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mid links */}
            {MID_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setOpen(null)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold transition-colors",
                  isActive(href) ? "text-[#0B6E6E] bg-[#E6F7F7]" : "text-[#0D2B35] hover:bg-[#E6F7F7] hover:text-[#0B6E6E]",
                )}>
                {label}
              </Link>
            ))}

            {/* Information accordion */}
            <div>
              <button
                onClick={() => setMobileInfoOpen((p) => !p)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Info className="h-4 w-4 text-[#0B6E6E]" /> Information
                </span>
                <ChevronDown className={cn("h-4 w-4 text-[#4A7B86] transition-transform duration-200", mobileInfoOpen ? "rotate-180" : "")} />
              </button>

              <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", mobileInfoOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="mt-1 ml-4 border-l border-[#D0EBEB] pl-4 pb-2">
                  {INFO_ITEMS.map(({ label, href, Icon }) => (
                    <Link key={href} href={href} onClick={() => setOpen(null)}
                      className="flex items-center gap-2.5 py-2 text-[13px] text-[#4A7B86] hover:text-[#0B6E6E] transition-colors">
                      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#0E9E9E]" /> {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth + WhatsApp */}
            <div className="pt-2 border-t border-[#D0EBEB] mt-2 space-y-0.5">
              {isLoggedIn ? (
                <>
                  <Link href="/account/profile" onClick={() => setOpen(null)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors">
                    <User className="h-4 w-4 text-[#0B6E6E]" /> My Profile
                  </Link>
                  <Link href="/account/orders" onClick={() => setOpen(null)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors">
                    <ClipboardList className="h-4 w-4 text-[#0B6E6E]" /> My Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/account/login" onClick={() => setOpen(null)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors">
                    <LogIn className="h-4 w-4 text-[#0B6E6E]" /> Sign In
                  </Link>
                  <Link href="/account/register" onClick={() => setOpen(null)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold text-[#0D2B35] hover:bg-[#E6F7F7] transition-colors">
                    <UserPlus className="h-4 w-4 text-[#0B6E6E]" /> Create Account
                  </Link>
                </>
              )}
              <a href="https://wa.me/6591234567" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-3 py-3.5 text-[14px] font-semibold text-green-700 hover:bg-green-50 transition-colors">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
