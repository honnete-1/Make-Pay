"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { allowBrowserApp, isInstalledPwa, usePwaInstall } from "@/hooks/use-pwa-install";

/** Blocks the passenger app in a normal browser tab — install the PWA to continue. */
export function RequireInstall({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const { canPrompt, promptInstall } = usePwaInstall();
  const isInstallRoute = pathname === "/app/install";

  useEffect(() => {
    const ok = isInstalledPwa() || allowBrowserApp() || isInstallRoute;
    setAllowed(ok);
    setReady(true);
    // Send browser users to the install page so Add to Home Screen saves /app, not /
    if (!ok && pathname !== "/app/install") {
      window.location.replace("/app/install");
    }
  }, [isInstallRoute, pathname]);

  if (!ready) {
    return <div className="min-h-dvh bg-cream" aria-hidden />;
  }

  if (allowed) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col bg-cream px-5 safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <Logo />
        <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="mt-10 size-[72px] rounded-[18px] shadow-float" />
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-forest">Download Mâke pay to continue</h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          The passenger app runs as an installed app on your phone — not in the browser.
        </p>
        <div className="mt-8">
          {canPrompt ? (
            <Button size="xl" block onClick={() => void promptInstall()}>
              <Download /> Install Mâke pay
            </Button>
          ) : (
            <Button size="xl" block onClick={() => { window.location.href = "/app/install"; }}>
              <Download /> How to download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
