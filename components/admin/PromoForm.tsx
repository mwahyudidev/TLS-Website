"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeeklyPromo } from "@/db/schema";

type Props = { initial?: WeeklyPromo };

type ProductOption = { id: number; name: string; sku: string; priceCents: number };

function toDateInputValue(unix: number) {
  return new Date(unix * 1000).toISOString().slice(0, 10);
}
function fromDateInput(val: string) {
  return Math.floor(new Date(val).getTime() / 1000);
}
function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PromoForm({ initial }: Props) {
  const router = useRouter();
  const now = Math.floor(Date.now() / 1000);
  const weekLater = now + 7 * 86400;

  const [form, setForm] = useState({
    title:       initial?.title ?? "",
    description: initial?.description ?? "",
    imageUrl:    initial?.imageUrl ?? "",
    badgeText:   initial?.badgeText ?? "",
    validFrom:   initial ? toDateInputValue(initial.validFrom)  : toDateInputValue(now),
    validUntil:  initial ? toDateInputValue(initial.validUntil) : toDateInputValue(weekLater),
    status:      initial?.status ?? "active",
    sortOrder:   String(initial?.sortOrder ?? 0),
  });

  const [allProducts, setAllProducts]       = useState<ProductOption[]>([]);
  const [selectedIds, setSelectedIds]       = useState<Set<number>>(new Set());
  const [productSearch, setProductSearch]   = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState("");

  /* Load all active products */
  useEffect(() => {
    setLoadingProducts(true);
    fetch("/api/admin/products?status=active&perPage=200")
      .then((r) => r.json())
      .then((json) => setAllProducts(json.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  /* Load existing linked product IDs when editing */
  useEffect(() => {
    if (!initial) return;
    fetch(`/api/admin/promos/${initial.id}/products`)
      .then((r) => r.json())
      .then((ids: number[]) => setSelectedIds(new Set(ids)))
      .catch(() => {});
  }, [initial]);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleProduct(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        validFrom:  fromDateInput(form.validFrom),
        validUntil: fromDateInput(form.validUntil),
        sortOrder:  Number(form.sortOrder),
      };
      const url    = initial ? `/api/admin/promos/${initial.id}` : "/api/admin/promos";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      const saved = await res.json();
      const promoId = initial?.id ?? saved.id;

      /* Save product links */
      await fetch(`/api/admin/promos/${promoId}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: [...selectedIds] }),
      });

      router.push("/admin/promos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this promo?")) return;
    setSaving(true);
    await fetch(`/api/admin/promos/${initial.id}`, { method: "DELETE" });
    router.push("/admin/promos");
    router.refresh();
  }

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ── Basic fields ── */}
      <div className="rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Campaign details</h3>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required disabled={saving} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="badgeText">Badge Text <span className="text-muted-foreground text-xs">(e.g. "This Week")</span></Label>
          <Input id="badgeText" value={form.badgeText} onChange={(e) => update("badgeText", e.target.value)} disabled={saving} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            disabled={saving}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Banner Image URL</Label>
          <Input id="imageUrl" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." disabled={saving} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="validFrom">Valid From *</Label>
            <Input id="validFrom" type="date" value={form.validFrom} onChange={(e) => update("validFrom", e.target.value)} required disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">Valid Until *</Label>
            <Input id="validUntil" type="date" value={form.validUntil} onChange={(e) => update("validUntil", e.target.value)} required disabled={saving} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} disabled={saving} />
          </div>
        </div>
      </div>

      {/* ── Product picker ── */}
      <div className="rounded-lg border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Linked Products
          </h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {selectedIds.size} selected
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          These products appear in the "This Week&apos;s Promos" section on the homepage.
          Set the <strong>Compare At Price</strong> on each product to show a sale badge.
        </p>

        <Input
          placeholder="Search products by name or SKU…"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />

        <div className="max-h-72 overflow-y-auto rounded-md border divide-y text-sm">
          {loadingProducts ? (
            <div className="py-6 text-center text-muted-foreground text-xs">Loading products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-xs">No products found.</div>
          ) : (
            filteredProducts.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="accent-primary"
                />
                <span className="flex-1 font-medium truncate">{p.name}</span>
                <span className="text-muted-foreground text-xs shrink-0">{formatMoney(p.priceCents)}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create promo"}
        </Button>
        {initial && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
