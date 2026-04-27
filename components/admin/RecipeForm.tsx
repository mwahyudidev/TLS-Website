"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Recipe } from "@/db/schema";

type Props = { initial?: Recipe };

export function RecipeForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    prepTimeMinutes: String(initial?.prepTimeMinutes ?? ""),
    cookTimeMinutes: String(initial?.cookTimeMinutes ?? ""),
    servings: String(initial?.servings ?? ""),
    difficulty: initial?.difficulty ?? "easy",
    ingredients: initial?.ingredients ?? "",
    instructions: initial?.instructions ?? "",
    tips: initial?.tips ?? "",
    status: initial?.status ?? "published",
    featured: initial?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(k: string, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        prepTimeMinutes: form.prepTimeMinutes ? Number(form.prepTimeMinutes) : undefined,
        cookTimeMinutes: form.cookTimeMinutes ? Number(form.cookTimeMinutes) : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
      };
      const url = initial ? `/api/admin/recipes/${initial.id}` : "/api/admin/recipes";
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
      router.push("/admin/recipes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this recipe?")) return;
    await fetch(`/api/admin/recipes/${initial.id}`, { method: "DELETE" });
    router.push("/admin/recipes");
    router.refresh();
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
        <Label htmlFor="description">Description</Label>
        <textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} disabled={saving} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." disabled={saving} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="prep">Prep (min)</Label>
          <Input id="prep" type="number" min="0" value={form.prepTimeMinutes} onChange={(e) => update("prepTimeMinutes", e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cook">Cook (min)</Label>
          <Input id="cook" type="number" min="0" value={form.cookTimeMinutes} onChange={(e) => update("cookTimeMinutes", e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min="1" value={form.servings} onChange={(e) => update("servings", e.target.value)} disabled={saving} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select id="difficulty" value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)} disabled={saving} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" value={form.status} onChange={(e) => update("status", e.target.value)} disabled={saving} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ingredients">Ingredients (one per line)</Label>
        <textarea
          id="ingredients"
          rows={6}
          disabled={saving}
          value={(() => {
            try { return (JSON.parse(form.ingredients || "[]") as string[]).join("\n"); } catch { return form.ingredients; }
          })()}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter((l) => l.trim());
            update("ingredients", JSON.stringify(lines));
          }}
          placeholder="500g tiger prawns&#10;3 cloves garlic&#10;..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="instructions">Instructions (one step per line)</Label>
        <textarea
          id="instructions"
          rows={8}
          disabled={saving}
          value={(() => {
            try { return (JSON.parse(form.instructions || "[]") as string[]).join("\n"); } catch { return form.instructions; }
          })()}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter((l) => l.trim());
            update("instructions", JSON.stringify(lines));
          }}
          placeholder="Clean and halve the crabs.&#10;Heat oil in a wok..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tips">Tips</Label>
        <textarea id="tips" value={form.tips} onChange={(e) => update("tips", e.target.value)} rows={2} disabled={saving} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} disabled={saving} className="h-4 w-4" />
        <Label htmlFor="featured">Featured on homepage</Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : initial ? "Save changes" : "Create recipe"}</Button>
        {initial && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>Delete</Button>
        )}
      </div>
    </form>
  );
}
