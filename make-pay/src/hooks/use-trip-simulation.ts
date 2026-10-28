"use client";

import { useEffect } from "react";
import { useTripStore } from "@/store/trip-store";

const TICK_MS = 250;

/**
 * Drives the trip simulator while a trip is active. Uses a coarse interval
 * (4 Hz) rather than rAF to stay light on low-end Android devices; the
 * MapLibre marker eases between updates.
 */
export function useTripSimulation(enabled: boolean) {
  const tick = useTripStore((s) => s.tick);
  useEffect(() => {
    if (!enabled) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      // Clamp large gaps (backgrounded tab) so the ride doesn't teleport.
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      tick(dt);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [enabled, tick]);
}
