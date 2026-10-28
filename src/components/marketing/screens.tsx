"use client";

import { Check, Clock, MapPin, Navigation, Search, Signal, ShieldCheck, Smartphone } from "lucide-react";
import { SchematicMap } from "@/components/trip/schematic-map";
import { computeRoute } from "@/lib/mock-services/routing.mock";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { pointAlong } from "@/lib/geo";
import { formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Presentational app screens used in marketing mockups. They render real
 * values from the deterministic demo engine so the story matches the app.
 */
const ROUTE = computeRoute("cbd", "kimironko");
const QUOTE = quoteFare(ROUTE.distanceKm);

function ScreenShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("absolute inset-0 flex flex-col pt-10", className)}>{children}</div>;
}

export function ScreenSearch() {
  return (
    <ScreenShell className="px-5">
      <p className="mt-3 text-[12px] text-ink-soft">Mwaramutse, Aline</p>
      <h3 className="font-display text-[26px] leading-[1.05] tracking-tight text-forest">Where are you going?</h3>
      <div className="mt-5 rounded-2xl bg-white p-1.5 shadow-float">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="size-2.5 rounded-full border-[3px] border-forest" />
          <span className="text-[13px] text-ink">Downtown · City Tower</span>
        </div>
        <div className="mx-3 h-px bg-stone" />
        <div className="flex items-center gap-3 rounded-xl bg-stone/60 px-3 py-2.5">
          <Search className="size-3.5 text-forest" />
          <span className="text-[13px] text-ink">Kimiro<span className="animate-pulse">|</span></span>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        {[
          ["Kimironko", "Kimironko Market"],
          ["Kibagabaga", "Kibagabaga Hospital"],
          ["Remera", "Giporoso · Amahoro"],
        ].map(([n, a], i) => (
          <div key={n} className={cn("flex items-center gap-3 rounded-xl px-2 py-2.5", i === 0 && "bg-lime/50")}>
            <span className="grid size-8 place-items-center rounded-full bg-white"><MapPin className="size-3.5 text-forest" /></span>
            <span>
              <span className="block text-[13px] font-medium text-ink">{n}</span>
              <span className="block text-[11px] text-ink-soft">{a}</span>
            </span>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

export function ScreenRoute() {
  return (
    <ScreenShell className="pt-0">
      <div className="relative h-[58%]">
        <SchematicMap path={ROUTE.path} originId="cbd" destinationId="kimironko" fitToPath showLabels={false} />
      </div>
      <div className="-mt-6 flex-1 rounded-t-[26px] bg-cream px-5 pt-3 shadow-[0_-10px_30px_-12px_rgb(18_61_53/0.3)]">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-stone-dark" />
        <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Recommended route</p>
        <p className="mt-1 font-display text-[20px] text-forest">Downtown → Kimironko</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Distance" value={`${ROUTE.distanceKm.toFixed(1)} km`} />
          <Stat label="Ride time" value={`~${ROUTE.durationMin} min`} />
        </div>
        <p className="mt-3 text-[11px] text-ink-soft">via {ROUTE.via.slice(0, 3).join(" · ")}</p>
      </div>
    </ScreenShell>
  );
}

export function ScreenFare() {
  return (
    <ScreenShell className="bg-forest px-5 text-cream">
      <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-cream/60">Estimated fare</p>
      <p className="mt-2 font-display text-[54px] leading-none tracking-tight text-lime tabular">{formatRWF(QUOTE.fare, false)}</p>
      <p className="text-[13px] text-cream/70">RWF · {ROUTE.distanceKm.toFixed(1)} km</p>
      <div className="mt-6 space-y-2.5 rounded-2xl bg-white/6 p-4 text-[12px]">
        <Row k={`Base fare (first 2 km)`} v={formatRWF(QUOTE.baseFare)} />
        <Row k={`${(QUOTE.distanceKm - 2).toFixed(1)} km × 160`} v={formatRWF(QUOTE.distanceCharge)} />
        <Row k="Rounded to nearest 50" v={formatRWF(QUOTE.fare)} strong />
      </div>
      <p className="mt-4 text-[10px] leading-snug text-cream/50">Illustrative demo tariff — not an official fare.</p>
      <div className="mt-auto mb-6 grid h-12 place-items-center rounded-full bg-lime text-[14px] font-semibold text-forest">Start journey</div>
    </ScreenShell>
  );
}

export function ScreenTracking({ progress = 0.56 }: { progress?: number }) {
  const { point, travelled } = pointAlong(ROUTE.path, progress);
  const km = ROUTE.distanceKm * progress;
  const fare = quoteFare(km).fare;
  return (
    <ScreenShell className="pt-0">
      <div className="relative h-[55%]">
        <SchematicMap path={ROUTE.path} travelled={travelled} position={point} originId="cbd" destinationId="kimironko" fitToPath showLabels={false} animateDraw={false} />
        <div className="absolute left-3 top-11 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-forest shadow-float">
          <Signal className="size-3" /> Simulated GPS · Strong
        </div>
      </div>
      <div className="flex-1 bg-cream px-5 pt-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Running fare</p>
        <p className="font-display text-[44px] leading-none tracking-tight text-forest tabular">
          {formatRWF(fare, false)} <span className="text-[16px] text-ink-soft">RWF</span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Travelled" value={`${km.toFixed(1)} km`} icon={<Navigation className="size-3" />} />
          <Stat label="Elapsed" value="12:04" icon={<Clock className="size-3" />} />
        </div>
      </div>
    </ScreenShell>
  );
}

export function ScreenPaid() {
  return (
    <ScreenShell className="items-center px-6 text-center">
      <div className="mt-14 grid size-20 place-items-center rounded-full bg-lime">
        <Check className="size-9 text-forest" strokeWidth={3} />
      </div>
      <p className="mt-5 font-display text-[26px] leading-tight text-forest">Payment confirmed</p>
      <p className="mt-1 text-[12px] text-ink-soft">Demo · no real money moved</p>
      <div className="mt-6 w-full space-y-2.5 rounded-2xl bg-white p-4 text-left text-[12px] shadow-float">
        <Row k="Fare" v={formatRWF(QUOTE.fare)} dark />
        <Row k="Platform fee" v={formatRWF(QUOTE.platformFee)} dark />
        <div className="h-px bg-stone" />
        <Row k="Total" v={formatRWF(QUOTE.total)} strong dark />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-forest">
        <ShieldCheck className="size-3.5" /> No PIN was requested by Mâke pay
      </div>
    </ScreenShell>
  );
}

export function ScreenMomo() {
  return (
    <ScreenShell className="px-5">
      <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-ink-soft">MoMo checkout · demo</p>
      <p className="font-display text-[24px] leading-tight text-forest">Pay your rider</p>
      <div className="mt-4 rounded-2xl border border-forest bg-white px-4 py-3">
        <p className="text-[10px] text-ink-soft">Rider&apos;s MoMo number</p>
        <p className="text-[16px] tracking-wide text-ink tabular">078 812 3456</p>
      </div>
      <div className="mt-3 space-y-2 rounded-2xl bg-stone/70 p-4 text-[12px]">
        <Row k="Fare" v={formatRWF(QUOTE.fare)} dark />
        <Row k="Platform fee" v={formatRWF(QUOTE.platformFee)} dark />
        <Row k="Total" v={formatRWF(QUOTE.total)} strong dark />
      </div>
      <div className="mt-auto mb-6 flex h-12 items-center justify-center gap-2 rounded-full bg-forest text-[14px] font-semibold text-cream">
        <Smartphone className="size-4" /> Confirm payment
      </div>
    </ScreenShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-[0_1px_0_rgb(18_61_53/0.06)]">
      <p className="flex items-center gap-1 text-[10px] text-ink-soft">{icon}{label}</p>
      <p className="text-[15px] font-semibold text-ink tabular">{value}</p>
    </div>
  );
}

function Row({ k, v, strong, dark }: { k: string; v: string; strong?: boolean; dark?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between tabular", strong && "font-semibold", dark ? "text-ink" : "text-cream/85")}>
      <span className={cn(!strong && (dark ? "text-ink-soft" : "text-cream/60"))}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
