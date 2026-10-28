"use client";

import { motion } from "motion/react";

/** Fade-and-rise on first view. Honours reduced motion via MotionConfig. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const C = motion[as];
  return (
    <C
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </C>
  );
}

export function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`mb-5 flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.16em] ${tone === "dark" ? "text-forest-600" : "text-lime"}`}>
      <span aria-hidden className={`h-px w-8 ${tone === "dark" ? "bg-forest/40" : "bg-lime/60"}`} />
      {children}
    </p>
  );
}
