"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Truck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/server/modules/cart/service";
import type { CheckoutInput, SelectedShipping } from "@/server/modules/checkout/validators";

type ProviderOption = {
  id: string;
  displayName: string;
  description: string;
};

type EPRateOption = {
  serviceId: string;
  serviceName: string;
  courierId: string;
  courierName: string;
  priceCents: number;
  estimatedDelivery: string;
};

type Initial = {
  cart: { lines: CartLine[]; subtotalCents: number };
  providers: ProviderOption[];
  shipping: { flatRateCents: number; freeThresholdCents: number };
  epEnabled: boolean;
  prefill: {
    name: string;
    email: string;
    phone: string;
  } | null;
};

export function CheckoutForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discountCents, setDiscountCents] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // EasyParcel rate picker state
  const [epRates, setEpRates] = useState<EPRateOption[]>([]);
  const [epLoading, setEpLoading] = useState(false);
  const [epError, setEpError] = useState<string | null>(null);
  const [epFreeShipping, setEpFreeShipping] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<SelectedShipping | null>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const lastFetchedPostcode = useRef<string>("");

  const subtotal = initial.cart.subtotalCents;
  const freeShipping =
    epFreeShipping || subtotal >= initial.shipping.freeThresholdCents;
  const shippingCents = freeShipping
    ? 0
    : selectedShipping?.priceCents ?? initial.shipping.flatRateCents;
  const grand = Math.max(0, subtotal - discountCents) + shippingCents;

  async function fetchEPRates(postalCode: string) {
    const pc = postalCode.trim();
    if (!pc || pc === lastFetchedPostcode.current) return;
    lastFetchedPostcode.current = pc;
    setEpLoading(true);
    setEpError(null);
    setEpRates([]);
    setSelectedShipping(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode: pc,
          cartSubtotalCents: subtotal,
          weightKg: Math.max(0.5, subtotal / 5000 / 100), // rough estimate
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setEpError(j?.error?.message ?? "Could not fetch rates");
        return;
      }
      setEpFreeShipping(j.data.freeShipping ?? false);
      setEpRates(j.data.rates ?? []);
      // Auto-select cheapest if rates available
      if (j.data.rates?.length) {
        const cheapest = [...j.data.rates].sort(
          (a: EPRateOption, b: EPRateOption) => a.priceCents - b.priceCents,
        )[0] as EPRateOption;
        setSelectedShipping({
          serviceId: cheapest.serviceId,
          courierId: cheapest.courierId,
          courierName: cheapest.courierName,
          serviceName: cheapest.serviceName,
          priceCents: cheapest.priceCents,
        });
      }
    } catch {
      setEpError("Could not connect to shipping service");
    } finally {
      setEpLoading(false);
    }
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    if (!coupon.trim()) return;
    const res = await fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponCode: coupon.trim() }),
    });
    const j = await res.json();
    if (!res.ok) {
      setCouponError(j?.error?.message ?? "Invalid coupon");
      setDiscountCents(0);
      setAppliedCoupon(null);
      return;
    }
    setDiscountCents(j.data.discountCents);
    setAppliedCoupon(j.data.appliedCoupon?.code ?? null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: CheckoutInput = {
      customer: {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
      },
      shippingAddress: {
        recipientName:
          String(fd.get("recipientName") ?? "") || String(fd.get("name") ?? ""),
        addressLine: String(fd.get("addressLine") ?? ""),
        addressLine2: String(fd.get("addressLine2") ?? "") || undefined,
        city: String(fd.get("city") ?? ""),
        province: String(fd.get("province") ?? "") || undefined,
        postalCode: String(fd.get("postalCode") ?? ""),
        country: String(fd.get("country") ?? "Singapore"),
      },
      paymentProviderId: String(
        fd.get("paymentProviderId") ?? "manual_simulation",
      ) as CheckoutInput["paymentProviderId"],
      selectedShipping: selectedShipping ?? undefined,
      couponCode: appliedCoupon ?? undefined,
      notes: String(fd.get("notes") ?? "") || undefined,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error?.message ?? "Checkout failed");
      return;
    }
    startTransition(() => {
      router.push(`/checkout/success/${j.data.orderNumber}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={initial.prefill?.name ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={initial.prefill?.email ?? ""}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                required
                defaultValue={initial.prefill?.phone ?? ""}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Shipping address</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="recipientName">Recipient name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder="Same as contact name if blank"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="addressLine">Address</Label>
              <Input id="addressLine" name="addressLine" required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="addressLine2">Apt / Unit (optional)</Label>
              <Input id="addressLine2" name="addressLine2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required defaultValue="Singapore" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">Province / State</Label>
              <Input id="province" name="province" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                required
                ref={postalCodeRef}
                onBlur={(e) => {
                  if (initial.epEnabled) fetchEPRates(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="Singapore" />
            </div>
          </div>
        </section>

        {/* EasyParcel rate picker — shown only when EP is enabled */}
        {initial.epEnabled && (
          <section className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#0E9E9E]" />
              Shipping method
            </h2>

            {freeShipping ? (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                Free shipping applied to your order.
              </div>
            ) : epLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching shipping rates…
              </div>
            ) : epError ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                {epError} — standard rate will apply.
              </div>
            ) : epRates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Enter your postal code above to see courier options.
              </p>
            ) : (
              <div className="space-y-2">
                {epRates
                  .sort((a, b) => a.priceCents - b.priceCents)
                  .map((rate) => (
                    <label
                      key={`${rate.courierId}-${rate.serviceId}`}
                      className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-foreground/30"
                    >
                      <input
                        type="radio"
                        name="epRate"
                        value={rate.serviceId}
                        checked={selectedShipping?.serviceId === rate.serviceId}
                        onChange={() =>
                          setSelectedShipping({
                            serviceId: rate.serviceId,
                            courierId: rate.courierId,
                            courierName: rate.courierName,
                            serviceName: rate.serviceName,
                            priceCents: rate.priceCents,
                          })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {rate.courierName} — {rate.serviceName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rate.estimatedDelivery}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#0B6E6E] shrink-0">
                        {formatMoney(rate.priceCents)}
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </section>
        )}

        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Payment method (simulated)</h2>
          <p className="text-xs text-muted-foreground">
            Real payment gateway is not active in this phase. All methods below
            are simulated and the admin will manually mark orders as paid.
          </p>
          <div className="space-y-2">
            {initial.providers.map((p, i) => (
              <label
                key={p.id}
                className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-foreground/30"
              >
                <input
                  type="radio"
                  name="paymentProviderId"
                  value={p.id}
                  defaultChecked={i === 0}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium">{p.displayName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Order notes (optional)</h2>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            placeholder="Special delivery instructions, gift message, etc."
          />
        </section>
      </div>

      <aside className="space-y-3">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
            {initial.cart.lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="line-clamp-1">
                  {l.quantity} × {l.name}
                </span>
                <span className="shrink-0">
                  {formatMoney(l.lineSubtotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="text-xs text-destructive">{couponError}</p>
            )}
            {appliedCoupon && (
              <p className="text-xs text-emerald-700">
                Coupon {appliedCoupon} applied
              </p>
            )}
          </div>

          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>−{formatMoney(discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingCents === 0 ? "Free" : formatMoney(shippingCents)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(grand)}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || initial.cart.lines.length === 0}
          >
            {isPending ? "Placing order…" : "Place order"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            By placing your order you agree to the (simulated) terms of service.
          </p>
        </div>
      </aside>
    </form>
  );
}
