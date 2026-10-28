"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Map as MapIcon, ReceiptText, UserRound, WifiOff } from "lucide-react";
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
    <header className={cn("relative z-30 flex h-16 shrink-0 items-center gap-3 px-4 safe-top md:px-6", transparent ? "absolute inset-x-0" : "bg-cream")}>
      {back ? (
        <button
          type="button"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-forest shadow-float"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : !title ? (
        <Link href="/app" aria-label="Mâke pay home" className="rounded-xl">
          <LogoMark className="size-10" />
        </Link>
      ) : null}
      {title && (
        <h1 className={cn("min-w-0 truncate font-display text-lg font-semibold text-forest", transparent && "rounded-full bg-white/90 px-4 py-2 shadow-float backdrop-blur")}>
          {title}
        </h1>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2">{right ?? <span className="size-11" aria-hidden />}</div>
    </header>
  );
}

export function PageColumn({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-xl flex-1 px-5 pb-6 md:px-6", className)}>{children}</div>;
}

/** Primary CTA pinned above the tab bar (or screen bottom when tabs are hidden). */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-forest/8 bg-cream/95 px-5 pb-4 pt-3 backdrop-blur-xl">
      {children}
    </div>
  );
}

const TABS = [
  { href: "/app", label: "Ride", Icon: MapIcon },
  { href: "/app/history", label: "Trips", Icon: ReceiptText },
  { href: "/app/profile", label: "Profile", Icon: UserRound },
] as const;

/** Ride · Trips · Profile. Hidden on full-screen flows (map, journey, payment, install). */
export function TabBar() {
  const path = usePathname();
  const visible =
    path === "/app" ||
    path.startsWith("/app/history") ||
    path.startsWith("/app/profile") ||
    path.startsWith("/app/receipt");
  if (!visible) return null;

  return (
    <nav aria-label="Main" className="z-30 shrink-0 border-t border-forest/10 bg-cream safe-bottom">
      <ul className="grid grid-cols-3">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === "/app"
              ? path === "/app"
              : path.startsWith(href) || (href === "/app/history" && path.startsWith("/app/receipt"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors",
                  active ? "text-forest" : "text-ink-soft hover:text-forest",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-lime")}>
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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
