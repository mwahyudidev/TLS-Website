"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/server/modules/cart/service";

export function CartLineRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function update(qty: number) {
    setError(null);
    if (qty < 1) {
      await remove();
      return;
    }
    const res = await fetch(`/api/cart/items/${line.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Failed to update");
      return;
    }
    startTransition(() => router.refresh());
  }
  async function remove() {
    setError(null);
    const res = await fetch(`/api/cart/items/${line.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Failed to remove");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${line.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {line.imageUrl && (
          <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="object-cover" />
        )}
      </Link>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${line.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
            {line.name}
          </Link>
          <button
            onClick={remove}
            disabled={busy}
            className="text-muted-foreground hover:text-destructive p-1"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {!line.available && (
          <p className="text-xs text-destructive">
            Only {line.stock} in stock — please reduce quantity
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border h-9">
            <button
              type="button"
              onClick={() => update(line.quantity - 1)}
              disabled={busy}
              className="px-2 h-full hover:bg-accent rounded-l-md"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="w-8 text-center text-sm font-medium">
              {line.quantity}
            </div>
            <button
              type="button"
              onClick={() => update(line.quantity + 1)}
              disabled={busy || line.quantity >= line.stock}
              className="px-2 h-full hover:bg-accent rounded-r-md"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-sm font-semibold">
            {formatMoney(line.lineSubtotalCents)}
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
