import { MegaNav } from "@/components/storefront/MegaNav";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";
import { Footer } from "@/components/storefront/Navbar";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { getWhatsAppLink } from "@/server/modules/social/service";
import { getCartItemCount } from "@/server/modules/cart/service";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [whatsappUrl, cartCount] = await Promise.all([
    getWhatsAppLink(),
    getCartItemCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <MegaNav />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton href={whatsappUrl ?? "https://wa.me/6591234567"} />
      <MobileBottomNav cartCount={cartCount} />
    </div>
  );
}
