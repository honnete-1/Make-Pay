import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Consistent marker for anything simulated or illustrative. */
export function DemoTag({
  children = "Illustrative",
  tone = "light",
  className,
}: {
  children?: React.ReactNode;
  tone?: "light" | "dark" | "lime";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
        tone === "light" && "bg-forest/8 text-forest",
        tone === "dark" && "bg-white/10 text-cream/85",
        tone === "lime" && "bg-lime text-forest",
        className,
      )}
    >
      <FlaskConical aria-hidden className="size-3" />
      {children}
    </span>
  );
}
