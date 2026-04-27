"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("success");
        setMessage(
          data.data?.alreadySubscribed
            ? "You're already subscribed! Check your inbox for deals."
            : "You're subscribed! Expect great seafood deals in your inbox.",
        );
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className={`text-center ${className}`}>
        <CheckCircle2 className="h-8 w-8 text-teal-500 mx-auto mb-2" />
        <p className="font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${className}`}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white text-foreground border-0 flex-1"
        disabled={state === "loading"}
      />
      <Button
        type="submit"
        disabled={state === "loading"}
        className="bg-white text-teal-700 hover:bg-teal-50 font-semibold"
      >
        {state === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
      {state === "error" && (
        <p className="text-red-300 text-sm mt-1 w-full">{message}</p>
      )}
    </form>
  );
}
