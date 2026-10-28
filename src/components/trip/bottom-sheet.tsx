"use client";

import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { ChevronUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Mobile: a draggable bottom sheet — `peek` and `footer` are always visible,
 * `children` expand/collapse by drag or tap.
 * Desktop (md+): a floating panel on the left of the map.
 */
export function BottomSheet({
  children,
  peek,
  footer,
  className,
  defaultExpanded = true,
  label = "Trip details",
}: {
  children: React.ReactNode;
  peek?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  label?: string;
}) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (desktop) {
    return (
      <motion.aside
        aria-label={label}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "absolute bottom-6 left-6 top-20 z-20 flex w-[420px] flex-col overflow-hidden rounded-[var(--radius-sheet)] bg-cream shadow-float",
          className,
        )}
      >
        <div className="no-scrollbar flex-1 overflow-y-auto p-7 pb-4">
          {peek}
          {children}
        </div>
        {footer && <div className="border-t border-forest/8 px-7 py-4">{footer}</div>}
      </motion.aside>
    );
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 50 || info.velocity.y > 500) setExpanded(false);
    else if (info.offset.y < -50 || info.velocity.y < -500) setExpanded(true);
  };

  return (
    <motion.aside
      aria-label={label}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className={cn("fixed inset-x-0 bottom-0 z-30 flex max-h-[88svh] flex-col rounded-t-[var(--radius-sheet)] bg-cream shadow-[0_-12px_40px_-16px_rgb(18_61_53/0.45)]", className)}
    >
      <motion.div drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={onDragEnd} className="touch-none">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Show more details"}
          className="flex w-full flex-col items-center pb-2 pt-3"
        >
          <span className="h-1.5 w-11 rounded-full bg-stone-dark" />
        </button>
        <div className="px-5">{peek}</div>
      </motion.div>
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="min-h-0 overflow-hidden"
      >
        <div className="no-scrollbar max-h-[46svh] overflow-y-auto px-5 pb-3">{children}</div>
      </motion.div>
      {!expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="mx-auto -mt-1 mb-1 flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium text-ink-soft">
          <ChevronUp className="size-3.5" /> More details
        </button>
      )}
      {footer && <div className="border-t border-forest/8 px-5 pt-3 safe-bottom">{footer}</div>}
      {!footer && <div className="safe-bottom" />}
    </motion.aside>
  );
}
