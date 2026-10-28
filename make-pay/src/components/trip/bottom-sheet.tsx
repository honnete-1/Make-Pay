"use client";

import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { ChevronUp } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Draggable bottom sheet over the map. `peek` and `footer` are always
 * visible; `children` expand or collapse by drag or tap. Positioned against
 * the app column, so it works the same on phones and in the desktop preview.
 */
export function BottomSheet({
  children,
  peek,
  footer,
  className,
  defaultExpanded = false,
  label = "Trip details",
}: {
  children?: React.ReactNode;
  peek?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  label?: string;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasMore = !!children;

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
      className={cn("fixed inset-x-0 bottom-0 z-30 flex max-h-[86%] flex-col rounded-t-[28px] bg-cream shadow-[0_-12px_40px_-16px_rgb(23_60_50/0.45)]", className)}
    >
      <motion.div drag={hasMore ? "y" : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={onDragEnd} className="touch-none">
        <button
          type="button"
          onClick={() => hasMore && setExpanded((e) => !e)}
          aria-expanded={hasMore ? expanded : undefined}
          aria-label={expanded ? t.common.showLess : t.common.moreDetails}
          tabIndex={hasMore ? 0 : -1}
          className="flex w-full flex-col items-center pb-2 pt-3"
        >
          <span className="h-1.5 w-11 rounded-full bg-stone-dark" />
        </button>
        <div className="px-5">{peek}</div>
      </motion.div>
      {hasMore && (
        <>
          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="min-h-0 overflow-hidden"
          >
            <div className="no-scrollbar max-h-[40svh] overflow-y-auto px-5 pb-3">{children}</div>
          </motion.div>
          <button type="button" onClick={() => setExpanded((e) => !e)} className="mx-auto -mt-1 mb-1 flex min-h-9 items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium text-ink-soft">
            <ChevronUp className={cn("size-3.5 transition-transform", expanded && "rotate-180")} /> {expanded ? t.common.showLess : t.common.moreDetails}
          </button>
        </>
      )}
      {footer && <div className="border-t border-forest/8 px-5 pb-4 pt-3 safe-bottom">{footer}</div>}
      {!footer && <div className="safe-bottom" />}
    </motion.aside>
  );
}
