"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";
type Props = { initialMode: Mode };

const SLIDES = [
  {
    id: "login" as const,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=90&auto=format&fit=crop",
    heading: "Singapore's freshest seafood, delivered to your door.",
    sub: "Live · Fresh · Frozen — sourced daily",
  },
  {
    id: "register" as const,
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=900&q=90&auto=format&fit=crop",
    heading: "Join thousands of happy customers islandwide.",
    sub: "Exclusive deals · Easy reorder · Tracked delivery",
  },
];

const inputClass =
  "w-full rounded-full border border-[#D0EBEB] bg-[#F8FFFE] px-4 py-3 text-sm text-[#0D2B35] placeholder:text-[#4A7B86]/50 outline-none focus:border-[#0B6E6E] focus:ring-2 focus:ring-[#0B6E6E]/15 transition-all";

export function AuthPage({ initialMode }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
  }

  useEffect(() => {
    window.history.replaceState(null, "", mode === "login" ? "/account/login" : "/account/register");
    setError(null);
    setShowPass(false);
    setShowConfirm(false);
  }, [mode]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Invalid email or password.");
      return;
    }
    const j = await res.json();
    const role = j?.data?.user?.role;
    router.push(role === "customer" ? "/account/profile" : "/admin");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm")  as string;
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     fd.get("name"),
        email:    fd.get("email"),
        phone:    fd.get("phone") || undefined,
        password: fd.get("password"),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message ?? "Registration failed.");
      return;
    }
    router.push("/account/profile");
    router.refresh();
  }

  const isLogin    = mode === "login";
  const isRegister = mode === "register";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden flex shadow-[0_24px_80px_rgba(11,110,110,0.14)] bg-white">

        {/* ── LEFT: form panel ── */}
        <div className="flex-1 flex flex-col px-8 py-10 md:px-12 md:py-14 min-w-0 overflow-hidden">

          {/* Back link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#4A7B86] hover:text-[#0B6E6E] transition-colors w-fit shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <Link href="/" className="mb-8 block w-fit shrink-0">
            <Image
              src="/brand/logo-main.svg"
              alt="The Line Seafood"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Slider — both forms live side-by-side; translateX shifts which is visible */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: "200%",
                transform: isLogin ? "translateX(0)" : "translateX(-50%)",
              }}
            >

              {/* ── SIGN IN (left slot) ── */}
              <div
                className="w-1/2 flex flex-col pr-6"
                aria-hidden={!isLogin}
                style={{ pointerEvents: isLogin ? "auto" : "none" }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
                    Welcome back
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Sign in to your account to continue shopping.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0D2B35]" htmlFor="login-email">
                      Email
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      tabIndex={isLogin ? 0 : -1}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0D2B35]" htmlFor="login-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        tabIndex={isLogin ? 0 : -1}
                        className={cn(inputClass, "pr-12")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        tabIndex={isLogin ? 0 : -1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7B86] hover:text-[#0B6E6E] transition-colors"
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-[#4A7B86] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="remember"
                        tabIndex={isLogin ? 0 : -1}
                        className="accent-[#0B6E6E] rounded"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      tabIndex={isLogin ? 0 : -1}
                      className="text-sm font-medium text-[#0B6E6E] hover:text-[#0E9E9E] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && isLogin && (
                    <p className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={isLogin ? 0 : -1}
                    className="w-full rounded-full py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-button)" }}
                  >
                    {busy ? "Signing in…" : "Sign In"}
                  </button>

                  <p className="text-center text-sm text-[#4A7B86]">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      tabIndex={isLogin ? 0 : -1}
                      className="font-semibold text-[#0B6E6E] hover:text-[#0E9E9E] transition-colors"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              </div>

              {/* ── SIGN UP (right slot) ── */}
              <div
                className="w-1/2 flex flex-col pl-6"
                aria-hidden={!isRegister}
                style={{ pointerEvents: isRegister ? "auto" : "none" }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
                    Create account
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Join us for exclusive deals and fresh seafood delivered islandwide.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0D2B35]" htmlFor="reg-name">
                        Full Name
                      </label>
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        required
                        placeholder="John Tan"
                        tabIndex={isRegister ? 0 : -1}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0D2B35]" htmlFor="reg-email">
                        Email
                      </label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        tabIndex={isRegister ? 0 : -1}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone (full width) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0D2B35]" htmlFor="reg-phone">
                      Phone{" "}
                      <span className="text-[#4A7B86] font-normal">(optional)</span>
                    </label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      placeholder="+65 9123 4567"
                      tabIndex={isRegister ? 0 : -1}
                      className={inputClass}
                    />
                  </div>

                  {/* Row 3: Password + Confirm */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0D2B35]" htmlFor="reg-password">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          name="password"
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="Min. 8 chars"
                          tabIndex={isRegister ? 0 : -1}
                          className={cn(inputClass, "pr-11")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((p) => !p)}
                          tabIndex={isRegister ? 0 : -1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7B86] hover:text-[#0B6E6E] transition-colors"
                          aria-label={showPass ? "Hide password" : "Show password"}
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0D2B35]" htmlFor="reg-confirm">
                        Confirm
                      </label>
                      <div className="relative">
                        <input
                          id="reg-confirm"
                          name="confirm"
                          type={showConfirm ? "text" : "password"}
                          required
                          placeholder="Re-enter"
                          tabIndex={isRegister ? 0 : -1}
                          className={cn(inputClass, "pr-11")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          tabIndex={isRegister ? 0 : -1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7B86] hover:text-[#0B6E6E] transition-colors"
                          aria-label={showConfirm ? "Hide" : "Show"}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && isRegister && (
                    <p className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={isRegister ? 0 : -1}
                    className="w-full rounded-full py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-button)" }}
                  >
                    {busy ? "Creating account…" : "Create Account"}
                  </button>

                  <p className="text-center text-sm text-[#4A7B86]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      tabIndex={isRegister ? 0 : -1}
                      className="font-semibold text-[#0B6E6E] hover:text-[#0E9E9E] transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: image slider panel (hidden on mobile) ── */}
        <div className="hidden md:block relative w-[46%] flex-shrink-0 overflow-hidden">

          {/* Each slide is absolutely positioned — no h-full chain needed */}
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: mode === s.id
                  ? "translateX(0)"
                  : i === 0
                    ? "translateX(-100%)"
                    : "translateX(100%)",
              }}
            >
              <Image
                src={s.image}
                alt={s.heading}
                fill
                sizes="46vw"
                className="object-cover"
                priority={s.id === "login"}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#083D4F]/50 via-transparent to-[#0B6E6E]/35" />
            </div>
          ))}

          {/* Captions — fade + rise per mode */}
          <div className="absolute bottom-16 left-6 right-6 pointer-events-none">
            {SLIDES.map((s) => (
              <div
                key={s.id}
                className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  opacity:   mode === s.id ? 1 : 0,
                  transform: mode === s.id ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <p className="text-white font-bold text-lg leading-snug drop-shadow">
                  {s.heading}
                </p>
                <p className="text-white/70 text-sm mt-1 drop-shadow">{s.sub}</p>
              </div>
            ))}
            {/* spacer so the container has height */}
            <div aria-hidden className="invisible">
              <p className="font-bold text-lg leading-snug">x</p>
              <p className="text-sm mt-1">x</p>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2">
            {SLIDES.map((s) => (
              <button
                key={s.id}
                onClick={() => switchMode(s.id)}
                aria-label={`Switch to ${s.id}`}
                className="rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width:   mode === s.id ? "24px" : "8px",
                  height:  "8px",
                  opacity: mode === s.id ? 1 : 0.45,
                }}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
