"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setState("success");
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border bg-green-50 p-8 text-center">
        <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Message sent!</h3>
        <p className="text-sm text-muted-foreground">
          We've received your message and will get back to you within 24 hours. For urgent queries, WhatsApp us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Tan"
            required
            disabled={state === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@example.com"
            required
            disabled={state === "loading"}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+65 9000 0000"
          disabled={state === "loading"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="Order inquiry, product question..."
          required
          disabled={state === "loading"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message *</Label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us how we can help..."
          required
          rows={5}
          disabled={state === "loading"}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          minLength={10}
          maxLength={2000}
        />
      </div>
      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
      <Button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {state === "loading" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
