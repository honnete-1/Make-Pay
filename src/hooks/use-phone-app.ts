"use client";

import { useSyncExternalStore } from "react";
import { isInstalledPwa } from "@/hooks/use-pwa-install";

/** True when running from the home-screen / installed PWA (not a browser tab). */
export function useIsStandaloneApp(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener?.("change", onStoreChange);
      return () => mq.removeEventListener?.("change", onStoreChange);
    },
    () => isInstalledPwa(),
    () => false,
  );
}
