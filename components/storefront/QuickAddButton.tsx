"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Loader2 } from "lucide-react";

export function QuickAddButton({
  productId,
  disabled,
}: {
  productId: number;
  disabled?: boolean;
}) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (disabled) return null;

  async function handleAdd() {
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) return; // silently fail
      setDone(true);
      startTransition(() => router.refresh());
      setTimeout(() => setDone(false), 1800);
    } catch {
      // silently fail — cart errors are non-critical in card context
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      style={{
        boxShadow: isPending || done
          ? "none"
          : "0 4px 14px rgba(14,158,158,0.35)",
      }}
      className={[
        "flex w-full h-10 items-center justify-center gap-2",
        "rounded-full bg-[#0B6E6E] text-white text-sm font-semibold",
        "transition-all duration-[250ms] ease-[ease]",
        "hover:bg-[#0E9E9E] hover:-translate-y-px",
        "active:translate-y-0",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
      ].join(" ")}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <>
          <Check className="h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}
