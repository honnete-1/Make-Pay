"use client";

import { useEffect } from "react";
import { useTripStore } from "@/store/trip-store";

/** Pull session receipts from /api after the persist store rehydrates. */
export function HydrateReceipts() {
  const hydrateReceipts = useTripStore((s) => s.hydrateReceipts);
  useEffect(() => {
    void hydrateReceipts();
  }, [hydrateReceipts]);
  return null;
}
