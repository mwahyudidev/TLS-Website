import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { getCart } from "@/server/modules/cart/service";
import { getShippingConfig } from "@/server/modules/settings/service";
import { listPaymentProviders } from "@/server/providers/payment/registry";
import { getCurrentUser } from "@/server/lib/session";
import { isEasyParcelConfigured } from "@/lib/easyparcel";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) {
    redirect("/cart");
  }

  const [shipping, providers, user] = await Promise.all([
    getShippingConfig(),
    Promise.resolve(listPaymentProviders()),
    getCurrentUser(),
  ]);

  return (
    <div className="container py-10">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/cart" className="hover:underline">
          Cart
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Checkout</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Checkout</h1>

      <CheckoutForm
        initial={{
          cart: { lines: cart.lines, subtotalCents: cart.subtotalCents },
          providers,
          shipping,
          epEnabled: isEasyParcelConfigured(),
          prefill: user
            ? { name: user.name, email: user.email, phone: user.phone ?? "" }
            : null,
        }}
      />
    </div>
  );
}
