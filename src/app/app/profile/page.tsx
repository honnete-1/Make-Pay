"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  Info,
  Languages,
  ReceiptText,
  Smartphone,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { AppHeader, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";
import {
  clearProfilePrefs,
  DEFAULT_PROFILE_PREFS,
  readProfilePrefs,
  writeProfilePrefs,
  type ProfilePrefs,
} from "@/lib/profile-prefs";
import { useTripStore } from "@/store/trip-store";

const APP_VERSION = "0.1.0";

const HELP_FAQS = [
  {
    q: "Will Mâke pay ever ask for my MoMo PIN?",
    a: "Never. The payment request appears on your own phone and you approve it there. If anything inside Mâke pay asks for your PIN, it is not us.",
  },
  {
    q: "How is the fare estimated?",
    a: "400 RWF covers the first 2 km, then 160 RWF per additional kilometre, rounded to the nearest 50 RWF. A flat 20 RWF platform fee is shown separately.",
  },
  {
    q: "Where do trips and receipts live?",
    a: "On this device. Clearing trip history or session data removes them from this phone only.",
  },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">
      {children}
    </h2>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 overflow-hidden rounded-[20px] bg-white">{children}</div>;
}

function SettingsRow({
  icon: Icon,
  label,
  hint,
  children,
  href,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  hint?: string;
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const body = (
    <>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          danger ? "bg-danger/10 text-danger" : "bg-stone text-forest",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={cn("block text-[15px] font-medium", danger ? "text-danger" : "text-ink")}>
          {label}
        </span>
        {hint ? <span className="mt-0.5 block text-[13px] text-ink-soft">{hint}</span> : null}
      </span>
      {children}
      {href ? <ChevronRight className="size-4 shrink-0 text-ink-soft" aria-hidden /> : null}
    </>
  );

  const className = cn(
    "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-[15px] transition-colors",
    "border-t border-forest/6 first:border-t-0",
    (href || onClick) && "hover:bg-cream/80",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-forest" : "bg-stone-dark",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export default function ProfilePage() {
  const hydrated = useHydrated();
  const { receipts, clearHistory, resetJourney } = useTripStore();
  const { installed, canPrompt, promptInstall } = usePwaInstall();
  const [prefs, setPrefs] = useState<ProfilePrefs>(DEFAULT_PROFILE_PREFS);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearSession, setConfirmClearSession] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setPrefs(readProfilePrefs());
  }, [hydrated]);

  function updatePrefs(patch: Partial<ProfilePrefs>) {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      writeProfilePrefs(next);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1200);
      return next;
    });
  }

  function handleClearHistory() {
    clearHistory();
    setConfirmClearHistory(false);
  }

  function handleClearSession() {
    clearHistory();
    resetJourney();
    clearProfilePrefs();
    setPrefs(DEFAULT_PROFILE_PREFS);
    setConfirmClearSession(false);
  }

  if (!hydrated) return <LoadingScreen />;

  const initials = prefs.displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "M";

  const installHint = installed
    ? "Installed on this device"
    : canPrompt
      ? "Ready to add to home screen"
      : "Open install steps";

  return (
    <>
      <AppHeader title="Profile" right={<span />} />
      <PageColumn className="space-y-7 pb-10">
        <section className="rounded-[20px] bg-forest p-5 text-cream">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-full bg-lime font-display text-xl font-semibold text-forest">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold truncate">
                {prefs.displayName.trim() || "Passenger"}
              </p>
              <p className="mt-0.5 text-[13px] text-cream/70">
                {prefs.phone.trim() || "Details stay on this device"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-cream/70">
            Mâke pay · Kigali transit fares. No account required — trips and settings stay local.
          </p>
          {savedFlash ? (
            <p className="mt-2 text-[12px] font-medium text-lime" role="status">
              Saved on this device
            </p>
          ) : null}
        </section>

        <section>
          <SectionLabel>On this device</SectionLabel>
          <div className="mt-3 space-y-3 rounded-[20px] bg-white p-4">
            <div>
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                className="mt-2"
                placeholder="How you appear here"
                value={prefs.displayName}
                maxLength={40}
                autoComplete="name"
                onChange={(e) => updatePrefs({ displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                className="mt-2"
                type="tel"
                inputMode="tel"
                placeholder="07x xxx xxxx"
                value={prefs.phone}
                maxLength={16}
                autoComplete="tel"
                onChange={(e) => updatePrefs({ phone: e.target.value })}
              />
              <p className="mt-1.5 text-[12px] text-ink-soft">Stored only in this browser — not sent to a server.</p>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Preferences</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon={Wallet}
              label="MTN MoMo"
              hint={prefs.preferMomo ? "Preferred for fare approval" : "Turn on to prefer MoMo checkout"}
            >
              <Toggle
                checked={prefs.preferMomo}
                onChange={(preferMomo) => updatePrefs({ preferMomo })}
                label="Prefer MTN MoMo"
              />
            </SettingsRow>
            <SettingsRow
              icon={Bell}
              label="Trip reminders"
              hint="Local preference only — no push server yet"
            >
              <Toggle
                checked={prefs.notifications}
                onChange={(notifications) => updatePrefs({ notifications })}
                label="Trip reminders"
              />
            </SettingsRow>
            <SettingsRow
              icon={Languages}
              label="Language"
              hint="English · Kinyarwanda coming later"
            />
          </SettingsGroup>
        </section>

        <section>
          <SectionLabel>Trips & data</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon={ReceiptText}
              label="Trip history"
              hint={receipts.length === 0 ? "No trips yet" : `${receipts.length} on this device`}
              href="/app/history"
            />
            {confirmClearHistory ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-forest/6 px-4 py-3">
                <span className="mr-auto text-[14px] text-ink-soft">Delete all trips?</span>
                <Button size="sm" variant="danger" onClick={handleClearHistory}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClearHistory(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <SettingsRow
                icon={Trash2}
                label="Clear trip history"
                hint="Removes receipts from this device"
                onClick={() => {
                  setConfirmClearSession(false);
                  setConfirmClearHistory(true);
                }}
                danger
              />
            )}
            {confirmClearSession ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-forest/6 px-4 py-3">
                <span className="mr-auto text-[14px] text-ink-soft">Clear name, trips & journey?</span>
                <Button size="sm" variant="danger" onClick={handleClearSession}>
                  Clear
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClearSession(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <SettingsRow
                icon={UserRound}
                label="Clear session data"
                hint="Resets local prefs and active journey"
                onClick={() => {
                  setConfirmClearHistory(false);
                  setConfirmClearSession(true);
                }}
                danger
              />
            )}
          </SettingsGroup>
        </section>

        <section>
          <SectionLabel>App</SectionLabel>
          <SettingsGroup>
            {canPrompt && !installed ? (
              <SettingsRow
                icon={Download}
                label="Install Mâke pay"
                hint="Add to home screen"
                onClick={() => void promptInstall()}
              />
            ) : (
              <SettingsRow
                icon={Smartphone}
                label="Install & home screen"
                hint={installHint}
                href={installed ? undefined : "/app/install"}
              />
            )}
            <SettingsRow icon={Info} label="About" hint={`Mâke pay v${APP_VERSION} · Demo simulation`} />
          </SettingsGroup>
        </section>

        <section>
          <SectionLabel>Help</SectionLabel>
          <div className="mt-3 rounded-[20px] bg-white px-4">
            <div className="flex items-center gap-3 border-b border-forest/6 py-3">
              <span className="grid size-10 place-items-center rounded-full bg-stone text-forest">
                <CircleHelp className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-medium text-ink">Common questions</p>
                <p className="text-[13px] text-ink-soft">Same answers as the website FAQ</p>
              </div>
            </div>
            <Accordion type="single" collapsible className="border-0">
              {HELP_FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`help-${i}`} className="border-forest/6">
                  <AccordionTrigger className="py-4 font-sans text-[15px] font-medium md:text-[15px]">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[14px] md:max-w-none">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Link
              href="/#faq"
              className="flex min-h-12 items-center justify-between gap-2 border-t border-forest/6 py-3 text-[14px] font-medium text-forest"
            >
              Full FAQ on the website
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </div>
        </section>

        <p className="px-1 text-[13px] text-ink-soft">
          Demo simulation — not a live payment product.{" "}
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-medium text-forest underline underline-offset-4"
          >
            Website <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </p>
      </PageColumn>
    </>
  );
}
