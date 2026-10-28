"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, WifiOff } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { useOnline } from "@/hooks/use-online";
import { cn } from "@/lib/utils";

/** Shown only when the device is offline. */
export function DemoBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="relative z-40 flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-center text-[12px] font-medium text-white">
      <WifiOff aria-hidden className="size-3.5" />
      You’re offline. Trips saved on this device still open.
    </div>
  );
}

export function AppHeader({
  title,
  back,
  transparent,
  right,
}: {
  title?: string;
  back?: string | true;
  transparent?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className={cn("relative z-30 flex h-16 items-center gap-3 px-4 safe-top md:px-6", transparent ? "absolute inset-x-0" : "bg-cream")}>
      {back ? (
        <button
          type="button"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="grid size-11 place-items-center rounded-full bg-white text-forest shadow-float"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : (
        <Link href="/app" aria-label="Mâke pay home" className="rounded-xl">
          <LogoMark className="size-10" />
        </Link>
      )}
      {title && <h1 className={cn("font-display text-lg font-semibold text-forest", transparent && "rounded-full bg-white/90 px-4 py-2 shadow-float backdrop-blur")}>{title}</h1>}
      <div className="ml-auto flex items-center gap-2">
        {right ?? (
          <Link href="/app/history" className="grid size-11 place-items-center rounded-full bg-white text-forest shadow-float" aria-label="Trip history">
            <History className="size-5" />
          </Link>
        )}
      </div>
    </header>
  );
}

export function PageColumn({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-xl px-5 pb-[calc(8rem+env(safe-area-inset-bottom))] md:px-6 md:pb-32", className)}>{children}</div>;
}

/** Sticky bottom action bar for primary CTAs on mobile. */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-forest/8 bg-cream/90 px-5 pt-3 backdrop-blur-xl safe-bottom md:static md:mx-auto md:mt-8 md:max-w-xl md:border-0 md:bg-transparent md:px-6 md:backdrop-blur-none">
      {children}
    </div>
  );
}

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-[60svh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-sm text-ink-soft">
        <span className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-stone text-forest">{icon}</div>
      <p className="mt-5 font-display text-2xl font-semibold text-forest">{title}</p>
      <p className="mt-2 max-w-xs text-[15px] text-ink-soft">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
