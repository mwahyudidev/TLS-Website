"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* Auto-focus input when opened */
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    onClose();
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: "rgba(8,61,79,0.55)", backdropFilter: "blur(4px)" }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_24px_64px_rgba(8,61,79,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <form onSubmit={submit}>
          <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#0E9E9E]">
            <Search className="h-5 w-5 flex-shrink-0 text-[#0E9E9E]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search seafood, recipes, categories…"
              className="flex-1 text-[15px] text-[#0D2B35] placeholder:text-[#4A7B86]/60 bg-transparent outline-none border-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#4A7B86] hover:text-[#0B6E6E] transition-colors"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-1 h-8 w-8 flex items-center justify-center rounded-full text-[#4A7B86] hover:bg-[#E6F7F7] hover:text-[#0B6E6E] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#0E9E9E] mb-3">
            Quick browse
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Live Seafood",   href: "/shop/live"       },
              { label: "Fresh Catch",    href: "/shop/fresh"      },
              { label: "Frozen",         href: "/shop/frozen"     },
              { label: "Child Pack",     href: "/shop/child-pack" },
              { label: "Family Bundles", href: "/shop/bundles"    },
              { label: "All Products",   href: "/shop"            },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium border border-[#D0EBEB] text-[#4A7B86] hover:border-[#0B6E6E] hover:text-[#0B6E6E] hover:bg-[#E6F7F7] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {query.trim() && (
            <button
              onClick={() => {
                const q = query.trim();
                if (q) { router.push(`/shop?q=${encodeURIComponent(q)}`); onClose(); }
              }}
              className="mt-4 w-full flex items-center justify-between rounded-xl px-4 py-3 bg-[#E6F7F7] hover:bg-[#0B6E6E] group transition-colors"
            >
              <span className="text-[13px] font-medium text-[#0B6E6E] group-hover:text-white transition-colors">
                Search for &ldquo;<span className="font-bold">{query.trim()}</span>&rdquo;
              </span>
              <ArrowRight className="h-4 w-4 text-[#0B6E6E] group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
