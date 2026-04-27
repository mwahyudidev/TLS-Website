"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContentPage } from "@/db/schema";

type Props = { initial?: ContentPage };

export function ContentPageForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    metaDescription: initial?.metaDescription ?? "",
    status: initial?.status ?? "published",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = initial ? `/api/admin/content/${initial.id}` : "/api/admin/content";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      router.push("/admin/content");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} required disabled={saving} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meta">Meta Description</Label>
        <Input id="meta" value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} disabled={saving} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">Page Body (JSON)</Label>
        <textarea
          id="body"
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          rows={16}
          disabled={saving}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-y"
          placeholder='{"sections": []}'
        />
        <p className="text-xs text-muted-foreground">Content is stored as JSON and rendered by the page template.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select id="status" value={form.status} onChange={(e) => update("status", e.target.value)} disabled={saving} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
    </form>
  );
}
