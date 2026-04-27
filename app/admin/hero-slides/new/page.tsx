"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/admin/PageHeader";

export default function NewHeroSlidePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaLabel: "",
    ctaUrl: "",
    slideType: "welcome",
    status: "active",
    sortOrder: 0,
  });

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create slide");
        return;
      }
      router.push("/admin/hero-slides");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Add Hero Slide"
        back={{ label: "Hero Slides", href: "/admin/hero-slides" }}
      />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ctaLabel">CTA Label</Label>
            <Input id="ctaLabel" value={form.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Shop Now" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaUrl">CTA URL</Label>
            <Input id="ctaUrl" value={form.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="/shop" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="slideType">Type</Label>
            <select id="slideType" value={form.slideType} onChange={(e) => update("slideType", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {["welcome","promo","subscription","category","whatsapp","custom"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Order</Label>
            <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} min={0} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Slide"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
