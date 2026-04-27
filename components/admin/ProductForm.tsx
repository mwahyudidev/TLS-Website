"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Category = { id: number; name: string };
type Initial = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  sku: string;
  weightGrams: number;
  status: "draft" | "active" | "archived";
  featured: boolean;
  imageUrl: string | null;
  categoryIds: number[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(initial?.categoryIds ?? []),
  );

  function toggleCategory(id: number) {
    setSelected((s) => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      slug: String(fd.get("slug") ?? "").trim() || undefined,
      description: String(fd.get("description") ?? "").trim() || undefined,
      priceCents: Math.round(Number(fd.get("price") ?? 0) * 100),
      compareAtPriceCents: fd.get("compareAtPrice")
        ? Math.round(Number(fd.get("compareAtPrice")) * 100)
        : null,
      stock: Number(fd.get("stock") ?? 0),
      sku: String(fd.get("sku") ?? "").trim(),
      weightGrams: Number(fd.get("weightGrams") ?? 0),
      status: String(fd.get("status") ?? "active") as "draft" | "active" | "archived",
      featured: fd.get("featured") === "on",
      imageUrl: String(fd.get("imageUrl") ?? "").trim() || undefined,
      categoryIds: Array.from(selected),
    };

    const url = initial?.id
      ? `/api/admin/products/${initial.id}`
      : "/api/admin/products";
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
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handle} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={initial?.name ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="auto-generated from name if blank"
                defaultValue={initial?.slug ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                defaultValue={initial?.description ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (SGD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : "0.00"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAtPrice">Compare-at price (optional)</Label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  initial?.compareAtPriceCents
                    ? (initial.compareAtPriceCents / 100).toFixed(2)
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={initial?.stock ?? 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                required
                defaultValue={initial?.sku ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weightGrams">Weight (g)</Label>
              <Input
                id="weightGrams"
                name="weightGrams"
                type="number"
                min="0"
                defaultValue={initial?.weightGrams ?? 0}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Primary image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                placeholder="https://..."
                defaultValue={initial?.imageUrl ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                File uploads can be added in a later phase. For now paste an
                image URL (Unsplash, etc.).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initial?.featured ?? false}
              />
              Featured on storefront
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? "Saving…" : initial?.id ? "Save changes" : "Create product"}
        </Button>
      </aside>
    </form>
  );
}
