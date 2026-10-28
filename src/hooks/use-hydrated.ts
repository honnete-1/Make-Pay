"use client";

import { useEffect, useState } from "react";
import { useTripStore } from "@/store/trip-store";

/** True once the persisted demo store has rehydrated from localStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useTripStore.persist.onFinishHydration(() => setHydrated(true));
    if (useTripStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
