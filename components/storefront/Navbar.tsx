import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, ChevronDown } from "lucide-react";
import { getCurrentUser } from "@/server/lib/session";
import { getStoreInfo } from "@/server/modules/settings/service";
import { getCartItemCount } from "@/server/modules/cart/service";

const SHOP_CATEGORIES = [
  { name: "Live", href: "/shop/live" },
  { name: "Fresh", href: "/shop/fresh" },
  { name: "Frozen", href: "/shop/frozen" },
  { name: "Child Pack", href: "/shop/child-pack" },
  { name: "Bundles", href: "/shop/bundles" },
];

const INFO_LINKS = [
  { name: "Our Story", href: "/pages/our-story" },
  { name: "About Us", href: "/pages/about" },
  { name: "FAQs", href: "/pages/faq" },
  { name: "T&Cs", href: "/pages/terms-and-conditions" },
  { name: "Privacy Policy", href: "/pages/privacy-policy" },
];

const PAYMENT_LOGOS = [
  { name: "HitPay", src: "/payments/hitpay.svg", width: 112, height: 42 },
  { name: "Stripe", src: "/payments/stripe.svg", width: 104, height: 42 },
  { name: "PayNow", src: "/payments/paynow.svg", width: 132, height: 42 },
  { name: "Visa", src: "/payments/visa.svg", width: 88, height: 42 },
  { name: "Mastercard", src: "/payments/mastercard.svg", width: 88, height: 42 },
  { name: "Apple Pay", src: "/payments/apple-pay.svg", width: 104, height: 42 },
  { name: "Google Pay", src: "/payments/google-pay.svg", width: 112, height: 42 },
  { name: "GrabPay", src: "/payments/grabpay.svg", width: 118, height: 42 },
];

export async function Navbar() {
  const [user, store, cartCount] = await Promise.all([
    getCurrentUser(),
    getStoreInfo(),
    getCartItemCount(),
  ]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-bold text-lg tracking-tight text-primary">
            {store.name}
          </span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Fresh · Live · Frozen
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Home
          </Link>

          {/* Shop dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              Shop <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-44 rounded-md border bg-popover shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-1">
                <Link
                  href="/shop"
                  className="block px-3 py-2 text-sm rounded hover:bg-accent font-medium"
                >
                  All Seafood
                </Link>
                <div className="my-1 border-t" />
                {SHOP_CATEGORIES.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block px-3 py-2 text-sm rounded hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/subscriptions"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Subscriptions
          </Link>
          <Link
            href="/recipes"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Recipes
          </Link>

          {/* Information dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              Information <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-52 rounded-md border bg-popover shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-1">
                {INFO_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-3 py-2 text-sm rounded hover:bg-accent"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/track-order"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/contact"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {user ? (
            <Link
              href="/account/profile"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/account/login"
              className="hidden sm:inline-flex items-center text-sm h-9 px-3 rounded-md hover:bg-accent"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold h-4 min-w-[16px] px-1">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden border-t overflow-x-auto">
        <div className="flex items-center gap-0.5 px-4 py-2 text-xs whitespace-nowrap">
          <Link href="/shop" className="px-2 py-1 rounded hover:bg-accent">All</Link>
          {SHOP_CATEGORIES.map((c) => (
            <Link key={c.href} href={c.href} className="px-2 py-1 rounded hover:bg-accent text-muted-foreground">
              {c.name}
            </Link>
          ))}
          <span className="text-border">|</span>
          <Link href="/subscriptions" className="px-2 py-1 rounded hover:bg-accent text-muted-foreground">Subscribe</Link>
          <Link href="/recipes" className="px-2 py-1 rounded hover:bg-accent text-muted-foreground">Recipes</Link>
          <Link href="/contact" className="px-2 py-1 rounded hover:bg-accent text-muted-foreground">Contact</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mt-16 bg-muted/30">
      <div className="container py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 text-sm">
        <div className="md:col-span-1">
          <Link href="/" className="inline-block mb-3">
            <Image
              src="/brand/logo-main.svg"
              alt="The Line Seafood"
              width={160}
              height={44}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-muted-foreground text-xs mb-4">
            Singapore's freshest seafood, delivered to your door.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/thelineseafoodsg" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/thelineseafoodsg" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@thelineseafoodsg" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
            </a>
            <a href="https://www.youtube.com/@thelineseafoodsg" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-3">Shop</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/shop" className="hover:text-foreground">All Seafood</Link></li>
            {SHOP_CATEGORIES.map((c) => (
              <li key={c.href}><Link href={c.href} className="hover:text-foreground">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Discover</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/shop" className="hover:text-foreground">All Products</Link></li>
            <li><Link href="/subscriptions" className="hover:text-foreground">Notify Me</Link></li>
            <li><Link href="/recipes" className="hover:text-foreground">Recipes</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Information</div>
          <ul className="space-y-2 text-muted-foreground">
            {INFO_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-foreground">{l.name}</Link></li>
            ))}
            <li><Link href="/track-order" className="hover:text-foreground">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Payment Methods</div>
          <ul className="flex flex-wrap items-center gap-2">
            {PAYMENT_LOGOS.map((method) => (
              <li key={method.name} className="leading-none">
                <Image
                  src={method.src}
                  alt={method.name}
                  width={method.width}
                  height={method.height}
                  className="h-8 w-auto"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {year} The Line Seafood. All rights reserved.</span>
          <span>Islandwide delivery · Freshness guaranteed</span>
        </div>
      </div>
    </footer>
  );
}
