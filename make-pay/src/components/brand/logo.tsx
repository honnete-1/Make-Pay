import { cn } from "@/lib/utils";

/** The Mâke pay mark: a route arc resolving into a confirmation dot. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="10" fill="#C7E874" />
      <path d="M8 22.5c0-6 4-9.5 8-9.5s8 3.5 8 9.5" fill="none" stroke="#173C32" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="8" cy="22.5" r="2.4" fill="#173C32" />
      <circle cx="24" cy="22.5" r="3.4" fill="#173C32" />
      <path d="M22.6 22.6l1 1 1.9-2" fill="none" stroke="#C7E874" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Wordmark — always "Mâke pay": capital M, accented â, lowercase pay. */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[23px] font-semibold leading-none tracking-[-0.035em]",
          tone === "dark" ? "text-forest" : "text-cream",
        )}
      >
        Mâke{" "}<span className="font-accent text-[1.08em] tracking-normal">pay</span>
      </span>
    </span>
  );
}
