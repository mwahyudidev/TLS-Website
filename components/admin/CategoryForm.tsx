"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Initial = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  status: "active" | "inactive";
  navGroup: string | null;
  sortOrder: number;
};

export function CategoryForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      slug: String(fd.get("slug") ?? "").trim() || undefined,
      description: String(fd.get("description") ?? "").trim() || undefined,
      imageUrl: String(fd.get("imageUrl") ?? "").trim() || undefined,
      status: String(fd.get("status") ?? "active") as "active" | "inactive",
      navGroup: String(fd.get("navGroup") ?? "").trim() || undefined,
      sortOrder: Number(fd.get("sortOrder") ?? 0),
    };
    const url = initial?.id
      ? `/api/admin/categories/${initial.id}`
      : "/api/admin/categories";
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
    router.push("/admin/categories");
    router.refresh();
  }

  async function deleteCategory() {
    if (!initial?.id) return;
    if (!confirm("Delete this category? Products will lose this category link.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${initial.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handle} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
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
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              defaultValue={initial?.description ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://..."
              defaultValue={initial?.imageUrl ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
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
            <div className="space-y-1.5">
              <Label htmlFor="navGroup">Nav group</Label>
              <select
                id="navGroup"
                name="navGroup"
                defaultValue={initial?.navGroup ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— None —</option>
                <option value="live">Live Seafood</option>
                <option value="fresh-frozen">Fresh &amp; Frozen</option>
                <option value="special">Special Packs</option>
              </select>
              <p className="text-[11px] text-muted-foreground">Controls which mega-menu column this category appears in.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={initial?.sortOrder ?? 0}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? "Saving…" : initial?.id ? "Save changes" : "Create category"}
        </Button>
        {initial?.id && (
          <Button
            type="button"
            onClick={deleteCategory}
            disabled={busy}
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
          >
            Delete category
          </Button>
        )}
      </aside>
    </form>
  );
}
