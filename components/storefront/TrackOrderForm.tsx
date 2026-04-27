"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrackOrderForm({
  defaultOrderNumber,
  defaultEmail,
}: {
  defaultOrderNumber?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // Validate before navigating to avoid showing a 404 page on bad input.
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error?.message ?? "Could not find order");
        return;
      }
      router.push(
        `/track-order/${encodeURIComponent(orderNumber.trim())}?email=${encodeURIComponent(email.trim())}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="orderNumber">Order number</Label>
        <Input
          id="orderNumber"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. TLS-2026-000123"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email used at checkout</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" disabled={busy} className="w-full" size="lg">
        {busy ? "Looking up…" : "Track order"}
      </Button>
    </form>
  );
}
