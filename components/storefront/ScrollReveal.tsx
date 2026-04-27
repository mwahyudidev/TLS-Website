"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const hidden: CSSProperties =
    direction === "left"
      ? { opacity: 0, transform: "translateX(-24px)" }
      : direction === "up"
        ? { opacity: 0, transform: "translateY(24px)" }
        : { opacity: 0 };

  const shown: CSSProperties = { opacity: 1, transform: "translateY(0) translateX(0)" };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(visible ? shown : hidden),
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
