"use client";

import { useState } from "react";
import { Bell, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  productId?: number;
  productName?: string;
  className?: string;
};

type Step = "idle" | "form" | "loading" | "success" | "error";

export function NotifyMeButton({ productId, productName, className }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    try {
      const res = await fetch("/api/availability-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          productId: productId ?? null,
          subscriptionType: "back_in_stock",
          notes: productName ? `Product: ${productName}` : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStep("success");
    } catch {
      setErrMsg("Something went wrong. Please try again.");
      setStep("error");
    }
  }

  if (step === "success") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">You&apos;re on the list!</p>
          <p className="text-xs text-green-600 mt-0.5">We&apos;ll notify you at <strong>{email}</strong> when this is back in stock.</p>
        </div>
      </div>
    );
  }

  if (step === "idle") {
    return (
      <Button
        variant="outline"
        className={cn("gap-2 border-teal-200 text-teal-700 hover:bg-teal-50", className)}
        onClick={() => setStep("form")}
      >
        <Bell className="h-4 w-4" />
        Notify Me When Available
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm text-teal-800 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Get notified when back in stock
        </p>
        <button
          onClick={() => setStep("idle")}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400"
        />
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400"
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400"
        />
        {step === "error" && (
          <p className="text-xs text-red-600">{errMsg}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          disabled={step === "loading"}
        >
          {step === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
          ) : (
            "Notify Me"
          )}
        </Button>
      </form>
    </div>
  );
}
