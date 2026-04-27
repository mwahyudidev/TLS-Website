"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";

export function AddToCartButton({
  productId,
  maxStock,
  outOfStock,
}: {
  productId: number;
  maxStock: number;
  outOfStock: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (outOfStock) {
    return (
      <Button disabled size="lg" className="w-full">
        Out of stock
      </Button>
    );
  }

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(maxStock, q + 1));

  async function add() {
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error?.message ?? "Failed to add to cart");
        return;
      }
      setDone(true);
      startTransition(() => router.refresh());
      setTimeout(() => setDone(false), 2000);
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center rounded-md border h-11">
          <button
            type="button"
            onClick={dec}
            className="px-3 h-full hover:bg-accent rounded-l-md"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="w-10 text-center font-medium">{qty}</div>
          <button
            type="button"
            onClick={inc}
            className="px-3 h-full hover:bg-accent rounded-r-md"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          onClick={add}
          size="lg"
          className="flex-1"
          disabled={isPending}
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {maxStock} in stock
      </p>
    </div>
  );
}
