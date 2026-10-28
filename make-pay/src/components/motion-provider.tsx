"use client";

import { MotionConfig } from "motion/react";

/** Respects the OS "reduce motion" setting across every Motion component. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      {children}
    </MotionConfig>
  );
}
