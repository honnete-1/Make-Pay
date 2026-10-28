"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, Map as MapIcon, ReceiptText, UserRound, WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useOnline } from "@/hooks/use-online";
import { LANGS, useLang, useT } from "@/i18n";
import { GOOGLE_ENABLED } from "@/lib/maps/config";
import { cn } from "@/lib/utils";

/** Persistent, honest reminder that this is a simulation. */
export function DemoBanner() {
  const online = useOnline();
  const t = useT();
  return (
    <div role="status" className={cn("relative z-40 flex shrink-0 items-center justify-center gap-2 px-4 py-1.5 text-center text-[12px] font-medium", online ? "bg-forest text-cream/90" : "bg-warning text-white")}>
      {online ? <FlaskConical aria-hidden className="size-3.5 shrink-0 text-lime" /> : <WifiOff aria-hidden className="size-3.5 shrink-0" />}
      <span className="line-clamp-1">{!online ? t.banner.offline : GOOGLE_ENABLED ? t.banner.google : t.banner.demo}</span>
    </div>
  );
}

/** EN | RW segmented switch. Switching never touches trip state. */
export function LanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <div role="radiogroup" aria-label="Language / Ururimi" className={cn("flex rounded-full bg-white p-1 shadow-float", className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={lang === l.code}
          aria-label={l.label}
          lang={l.code}
          onClick={() => setLang(l.code)}
          className={cn("h-9 min-w-11 rounded-full px-3 text-[13px] font-semibold transition-colors", lang === l.code ? "bg-forest text-cream" : "text-forest/70 hover:text-forest")}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function AppHeader({
  title,
  back,
  transparent,
  right,
  brand,
}: {
  title?: string;
  back?: string | true;
  transparent?: boolean;
  right?: React.ReactNode;
  /** Show the wordmark instead of a back button (home screen). */
  brand?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  return (
    <header className={cn("z-30 flex h-16 shrink-0 items-center gap-3 px-4", transparent ? "absolute inset-x-0 top-0" : "relative bg-cream")}>
      {back ? (
        <button
          type="button"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-forest shadow-float"
          aria-label={t.common.back}
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : brand ? (
        <Logo />
      ) : null}
      {title && (
        <h1 className={cn("min-w-0 truncate font-display text-lg font-semibold text-forest", transparent && "rounded-full bg-white/95 px-4 py-2 shadow-float backdrop-blur")}>{title}</h1>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2">{right ?? <LanguageToggle />}</div>
    </header>
  );
}

export function PageColumn({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full flex-1 px-5 pb-6", className)}>{children}</div>;
}

/** Primary action pinned to the bottom of the screen, above the tab bar. */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-forest/8 bg-cream/95 px-5 pb-4 pt-3 backdrop-blur-xl">
      {children}
    </div>
  );
}

const TABS = [
  { href: "/app", key: "ride", Icon: MapIcon },
  { href: "/app/history", key: "trips", Icon: ReceiptText },
  { href: "/app/profile", key: "profile", Icon: UserRound },
] as const;

/** Ride · Trips · Profile. Hidden on full-screen flows (map, ride, payment). */
export function TabBar() {
  const path = usePathname();
  const t = useT();
  const visible = path === "/app" || path.startsWith("/app/history") || path.startsWith("/app/profile") || path.startsWith("/app/receipt");
  if (!visible) return null;
  return (
    <nav aria-label="Main" className="z-30 shrink-0 border-t border-forest/10 bg-cream safe-bottom">
      <ul className="grid grid-cols-3">
        {TABS.map(({ href, key, Icon }) => {
          const active = href === "/app" ? path === "/app" : path.startsWith(href) || (key === "trips" && path.startsWith("/app/receipt"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors", active ? "text-forest" : "text-ink-soft hover:text-forest")}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-lime")}>
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {t.nav[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LoadingScreen({ label }: { label?: string }) {
  const t = useT();
  return (
    <div className="grid flex-1 place-items-center py-24">
      <div className="flex flex-col items-center gap-3 text-sm text-ink-soft" role="status">
        <span className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
        {label ?? t.common.loading}
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

