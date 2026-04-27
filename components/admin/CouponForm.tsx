"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Initial = {
  id?: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimumOrderCents: number;
  usageLimit: number | null;
  usedCount?: number;
  status: "active" | "inactive";
  startsAtUnix: number | null;
  expiresAtUnix: number | null;
};

function unixToDateInput(u: number | null): string {
  if (!u) return "";
  return new Date(u * 1000).toISOString().slice(0, 10);
}
function dateInputToUnix(s: string): number | null {
  if (!s) return null;
  return Math.floor(new Date(s).getTime() / 1000);
}

export function CouponForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [type, setType] = useState<"percentage" | "fixed">(
    initial?.type ?? "percentage",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const valueRaw = String(fd.get("value") ?? "0");
    const value =
      type === "percentage"
        ? Math.round(Number(valueRaw) * 100) // 10 -> 1000 (10.00%)
        : Math.round(Number(valueRaw) * 100); // 5 -> 500 cents
    const payload = {
      code: String(fd.get("code") ?? "").trim().toUpperCase(),
      type,
      value,
      minimumOrderCents: Math.round(
        Number(fd.get("minimumOrder") ?? "0") * 100,
      ),
      usageLimit: fd.get("usageLimit")
        ? Number(fd.get("usageLimit"))
        : null,
      status: String(fd.get("status") ?? "active") as "active" | "inactive",
      startsAtUnix: dateInputToUnix(String(fd.get("startsAt") ?? "")),
      expiresAtUnix: dateInputToUnix(String(fd.get("expiresAt") ?? "")),
    };
    const url = initial?.id
      ? `/api/admin/coupons/${initial.id}`
      : "/api/admin/coupons";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Save failed");
      return;
    }
    router.push("/admin/coupons");
    router.refresh();
  }

  async function deleteCoupon() {
    if (!initial?.id || !confirm("Delete this coupon?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/coupons/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return alert("Delete failed");
    router.push("/admin/coupons");
    router.refresh();
  }

  const valueDefault = initial
    ? (initial.value / 100).toFixed(2)
    : "10.00";

  return (
    <form onSubmit={handle} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coupon</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              defaultValue={initial?.code ?? ""}
              placeholder="SUMMER15"
              className="uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Discount type</Label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (SGD)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">
              {type === "percentage" ? "Percent off" : "Amount off (SGD)"}
            </Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={valueDefault}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minimumOrder">Minimum order (SGD)</Label>
            <Input
              id="minimumOrder"
              name="minimumOrder"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                initial ? (initial.minimumOrderCents / 100).toFixed(2) : "0.00"
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="usageLimit">Usage limit (blank = unlimited)</Label>
            <Input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              defaultValue={initial?.usageLimit ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startsAt">Starts at</Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="date"
              defaultValue={initial ? unixToDateInput(initial.startsAtUnix) : ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={initial ? unixToDateInput(initial.expiresAtUnix) : ""}
            />
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={initial?.status ?? "active"}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {initial?.usedCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                Used {initial.usedCount} times so far.
              </p>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? "Saving…" : initial?.id ? "Save changes" : "Create coupon"}
        </Button>
        {initial?.id && (
          <Button
            type="button"
            onClick={deleteCoupon}
            disabled={busy}
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
          >
            Delete coupon
          </Button>
        )}
      </aside>
    </form>
  );
}
