"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SettingsMap = Record<string, unknown>;

const SCHEMA: Array<{
  key: string;
  label: string;
  type: "text" | "textarea" | "money" | "number";
  hint?: string;
}> = [
  { key: "store.name", label: "Store name", type: "text" },
  { key: "store.tagline", label: "Tagline", type: "text" },
  { key: "store.email", label: "Contact email", type: "text" },
  { key: "store.phone", label: "Contact phone", type: "text" },
  { key: "store.address", label: "Address", type: "textarea" },
  { key: "store.currency", label: "Currency", type: "text", hint: "ISO code (SGD, USD, ...)" },
  {
    key: "shipping.flat_rate_cents",
    label: "Flat shipping rate",
    type: "money",
    hint: "Charged when below free-shipping threshold",
  },
  {
    key: "shipping.free_threshold_cents",
    label: "Free shipping threshold",
    type: "money",
    hint: "Order subtotal at which shipping is free",
  },
  {
    key: "stock.low_threshold",
    label: "Low stock threshold",
    type: "number",
    hint: "Trigger 'low stock' alerts in dashboard",
  },
  {
    key: "checkout.payment_instructions",
    label: "Checkout payment instructions",
    type: "textarea",
  },
  { key: "track_order.help_text", label: "Track order help text", type: "textarea" },
];

export function SettingsForm({ initial }: { initial: SettingsMap }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function getValue(key: string): string {
    const v = initial[key];
    if (v === undefined || v === null) return "";
    return String(v);
  }

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const entries = SCHEMA.map((s) => {
      const raw = String(fd.get(s.key) ?? "").trim();
      let value: unknown = raw;
      if (s.type === "money") value = Math.round(Number(raw || "0") * 100);
      if (s.type === "number") value = Number(raw || "0");
      return { key: s.key, value };
    });
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Save failed");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handle} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {SCHEMA.filter((s) => s.key.startsWith("store.")).map((s) => (
            <Field key={s.key} schema={s} value={getValue(s.key)} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping & stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {SCHEMA.filter(
            (s) =>
              s.key.startsWith("shipping.") || s.key.startsWith("stock."),
          ).map((s) => (
            <Field key={s.key} schema={s} value={getValue(s.key)} isCents={s.type === "money"} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checkout & tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SCHEMA.filter(
            (s) =>
              s.key.startsWith("checkout.") || s.key.startsWith("track_order."),
          ).map((s) => (
            <Field key={s.key} schema={s} value={getValue(s.key)} />
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Settings saved.
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  schema,
  value,
  isCents,
}: {
  schema: (typeof SCHEMA)[number];
  value: string;
  isCents?: boolean;
}) {
  const display = isCents
    ? value
      ? (Number(value) / 100).toFixed(2)
      : "0.00"
    : value;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={schema.key}>{schema.label}</Label>
      {schema.type === "textarea" ? (
        <textarea
          id={schema.key}
          name={schema.key}
          rows={3}
          className="w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          defaultValue={display}
        />
      ) : (
        <Input
          id={schema.key}
          name={schema.key}
          type={schema.type === "number" || schema.type === "money" ? "number" : "text"}
          step={schema.type === "money" ? "0.01" : undefined}
          min={schema.type === "money" || schema.type === "number" ? "0" : undefined}
          defaultValue={display}
        />
      )}
      {schema.hint && (
        <p className="text-xs text-muted-foreground">{schema.hint}</p>
      )}
    </div>
  );
}
