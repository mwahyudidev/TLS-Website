"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialLink } from "@/db/schema";

const PLATFORMS: { key: SocialLink["platform"]; label: string; placeholder: string }[] = [
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/6591234567" },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@yourchannel" },
];

export function IntegrationsForm({ links }: { links: SocialLink[] }) {
  const linkByPlatform = Object.fromEntries(links.map((l) => [l.platform, l]));

  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.key, linkByPlatform[p.key]?.url ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      for (const p of PLATFORMS) {
        const url = urls[p.key]?.trim();
        if (!url) continue;
        await fetch("/api/admin/social-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: p.key, url, isActive: true }),
        });
      }
      setSavedMsg("Saved successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {PLATFORMS.map((p) => (
        <div key={p.key} className="space-y-1.5">
          <Label htmlFor={p.key}>{p.label}</Label>
          <Input
            id={p.key}
            type="url"
            value={urls[p.key] ?? ""}
            onChange={(e) => setUrls((u) => ({ ...u, [p.key]: e.target.value }))}
            placeholder={p.placeholder}
            disabled={saving}
          />
        </div>
      ))}
      {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save links"}</Button>
    </form>
  );
}
