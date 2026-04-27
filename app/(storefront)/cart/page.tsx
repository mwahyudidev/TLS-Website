import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartLineRow } from "@/components/storefront/CartLineRow";
import { getCart } from "@/server/modules/cart/service";
import { getShippingConfig } from "@/server/modules/settings/service";
import { formatMoney } from "@/lib/format";

export default async function CartPage() {
  const cart = await getCart();
  const shipping = await getShippingConfig();

  const estimatedShippingCents =
    cart.subtotalCents >= shipping.freeThresholdCents || cart.lines.length === 0
      ? 0
      : shipping.flatRateCents;
  const estimatedTotalCents = cart.subtotalCents + estimatedShippingCents;
  const allAvailable = cart.lines.every((l) => l.available);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Your cart</h1>

      {cart.lines.length === 0 ? (
        <div className="rounded-lg border bg-card p-16 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mt-3">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse our catalog to find something you love.
          </p>
          <Button asChild className="mt-5">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-[1fr_360px]">
          <div className="rounded-lg border bg-card divide-y">
            <div className="px-5">
              {cart.lines.map((line) => (
                <CartLineRow key={line.id} line={line} />
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-lg border bg-card p-5 space-y-3">
              <h2 className="font-semibold">Order summary</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(cart.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated shipping</span>
                  <span>
                    {estimatedShippingCents === 0
                      ? "Free"
                      : formatMoney(estimatedShippingCents)}
                  </span>
                </div>
                {estimatedShippingCents > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping over {formatMoney(shipping.freeThresholdCents)}.
                  </p>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Estimated total</span>
                  <span>{formatMoney(estimatedTotalCents)}</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full"
                disabled={!allAvailable}
              >
                <Link href="/checkout">Continue to checkout</Link>
              </Button>
              {!allAvailable && (
                <p className="text-xs text-destructive">
                  Some items have stock issues — please update quantities first.
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Taxes calculated at checkout
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Real payments are not active yet — checkout uses a simulated flow.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
