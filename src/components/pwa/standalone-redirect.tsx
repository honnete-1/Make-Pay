"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isInstalledPwa } from "@/hooks/use-pwa-install";

/**
 * Installed Mâke pay is the passenger app only.
 * Any marketing/website URL opened from the home-screen icon is sent to /app.
 */
export function StandaloneRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isInstalledPwa()) return;
    if (!pathname.startsWith("/app")) {
      router.replace("/app");
    }
  }, [pathname, router]);

  return null;
}
