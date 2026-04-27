"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/admin/PageHeader";

export default function PageHeroEditPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const pageKey = sp.get("pageKey") ?? "";
  const label = sp.get("label") ?? pageKey;
  const isNew = sp.get("id") === null;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [heroId, setHeroId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaLabel: "",
    ctaUrl: "",
    status: "active",
  });

  useEffect(() => {
    if (!pageKey) return;
    fetch(`/api/admin/page-heroes?pageKey=${encodeURIComponent(pageKey)}`)
      .then((r) => r.json())
      .then((d) => {
        const hero = Array.isArray(d.data) ? d.data.find((h: { pageKey: string }) => h.pageKey === pageKey) : null;
        if (hero) {
          setHeroId(hero.id);
          setForm({
            title:    hero.title ?? "",
            subtitle: hero.subtitle ?? "",
            imageUrl: hero.imageUrl ?? "",
            ctaLabel: hero.ctaLabel ?? "",
            ctaUrl:   hero.ctaUrl ?? "",
            status:   hero.status ?? "active",
          });
        }
      })
      .catch(() => {});
  }, [pageKey]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/page-heroes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, ...form }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
        return;
      }
      router.push("/admin/page-heroes");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!heroId || !confirm("Reset this page hero to default?")) return;
    await fetch(`/api/admin/page-heroes/${heroId}`, { method: "DELETE" });
    router.push("/admin/page-heroes");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={`Hero: ${label}`}
        description={`Configure the hero banner for the ${label} page.`}
        back={{ label: "Page Heroes", href: "/admin/page-heroes" }}
      />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Headline *</Label>
          <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Background Image URL</Label>
          <Input id="imageUrl" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground">Leave empty to use the default gradient background.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ctaLabel">CTA Button Label</Label>
            <Input id="ctaLabel" value={form.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Shop Now" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaUrl">CTA Button URL</Label>
            <Input id="ctaUrl" value={form.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="/shop" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive (use default)</option>
          </select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
          {heroId && (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
              Reset to default
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
