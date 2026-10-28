"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownUp, ArrowRight, Clock, Navigation } from "lucide-react";
import type { Place } from "@/types";
import { ActionBar, AppHeader, LoadingScreen } from "@/components/app/app-chrome";
import { PlaceSearchSheet } from "@/components/trip/place-picker";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useT } from "@/i18n";
import { services } from "@/lib/services";
import { POPULAR_PLACE_IDS } from "@/lib/mock-services/fixtures/kigali-graph";
import { useTripStore } from "@/store/trip-store";
import { cn } from "@/lib/utils";

function partOfDay(): "morning" | "afternoon" | "evening" {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Kigali" }).format(new Date()));
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

/** Ride home: search first, map second. */
export default function RideHome() {
  const hydrated = useHydrated();
  const router = useRouter();
  const t = useT();
  const { originId, destinationId, recentDestinations, trip, setOrigin, setDestination } = useTripStore();
  const [sheet, setSheet] = useState<"from" | "to" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [areaStart, setAreaStart] = useState<Place | null>(null);
  const [part, setPart] = useState<ReturnType<typeof partOfDay>>("morning");
  useEffect(() => setPart(partOfDay()), []);

  if (!hydrated) return <LoadingScreen />;

  const origin = services.routing.getPlace(originId);
  const destination = services.routing.getPlace(destinationId);
  const activeTrip = trip && trip.status !== "completed";
  const ready = !!origin && !!destination && origin.id !== destination.id;

  const showRoute = (from = originId, to = destinationId) => {
    if (from && to && from !== to) router.push(`/app/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  /** Picking a destination with a valid start goes straight to the route. */
  const pickDestination = (p: Place) => {
    setDestination(p.id);
    if (originId && originId !== p.id) showRoute(originId, p.id);
  };

  const quick = [...new Set([...recentDestinations, ...POPULAR_PLACE_IDS])]
    .map((id) => services.routing.getPlace(id))
    .filter((p): p is Place => !!p && p.id !== originId)
    .slice(0, 6);

  return (
    <>
      <AppHeader brand />
      <div className="flex-1 px-5 pb-6">
        {activeTrip && (
          <Link href="/app/journey" className="mb-5 flex items-center gap-3 rounded-[22px] bg-forest p-4 text-cream">
            <span className="relative grid size-11 place-items-center rounded-full bg-lime text-forest">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-lime" />
              <Navigation className="relative size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold">{t.home.resume}</span>
              <span className="block text-[13px] text-cream/70">{t.home.resumeHint}</span>
            </span>
            <ArrowRight className="size-5 text-lime" />
          </Link>
        )}

        <p className="mt-3 text-[15px] text-ink-soft">{t.home.greeting[part]}</p>
        <h1 className="mt-1 font-display text-[2.6rem] font-medium leading-[0.98] tracking-[-0.04em] text-forest">{t.home.title}</h1>

        {/* A → B */}
        <div className="relative mt-6 rounded-[26px] bg-white p-2 shadow-float">
          <EndpointButton letter="A" label={t.home.from} value={origin?.name} placeholder={t.home.fromPlaceholder} sub={origin?.area} onClick={() => { setAreaStart(null); setSheet("from"); }} />
          <div aria-hidden className="mx-4 h-px bg-stone" />
          <EndpointButton letter="B" label={t.home.to} value={destination?.name} placeholder={t.home.toPlaceholder} sub={destination?.area} onClick={() => { setAreaStart(null); setSheet("to"); }} accent />
          <button
            type="button"
            onClick={() => {
              if (!destinationId) return;
              const o = originId;
              setOrigin(destinationId);
              setDestination(o);
            }}
            disabled={!destinationId}
            aria-label={t.home.swap}
            className="absolute right-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-forest/10 bg-cream text-forest disabled:opacity-30"
          >
            <ArrowDownUp className="size-4" />
          </button>
        </div>
        {note && <p role="status" className="mt-3 rounded-2xl bg-lime/40 px-4 py-3 text-[14px] text-forest">{note}</p>}

        {/* One-tap destinations */}
        <section className="mt-8" aria-labelledby="quick-h">
          <h2 id="quick-h" className="flex items-center gap-2 px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">
            <Clock className="size-3.5" /> {t.home.popular}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quick.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  if (!p.childIds?.length) return pickDestination(p);
                  setAreaStart(p);
                  setSheet("to");
                }}
                className={cn(
                  "min-h-[72px] rounded-[20px] px-4 py-3 text-left transition-colors",
                  p.id === destinationId ? "bg-lime text-forest" : "bg-stone/70 text-forest hover:bg-stone",
                )}
              >
                <span className="block truncate text-[16px] font-semibold">{p.name}</span>
                <span className="block truncate text-[12px] text-forest/65">{p.area}</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <ActionBar>
        <Button size="xl" block disabled={!ready} onClick={() => showRoute()}>
          {ready ? <>{t.home.showRoute} <ArrowRight /></> : origin && destination ? t.home.sameplace : t.home.chooseBoth}
        </Button>
      </ActionBar>

      <PlaceSearchSheet
        open={sheet !== null}
        onOpenChange={(o) => {
          if (o) return;
          setSheet(null);
          setAreaStart(null);
        }}
        startArea={sheet === "to" ? areaStart : null}
        mode={sheet ?? "to"}
        selectedId={sheet === "from" ? originId : destinationId}
        otherId={sheet === "from" ? destinationId : originId}
        onPick={(p, n) => {
          setNote(n ?? null);
          if (sheet === "from") setOrigin(p.id);
          else pickDestination(p);
        }}
      />
    </>
  );
}

function EndpointButton({
  letter,
  label,
  value,
  placeholder,
  sub,
  onClick,
  accent,
}: {
  letter: string;
  label: string;
  value?: string;
  placeholder: string;
  sub?: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[68px] w-full items-center gap-3 rounded-[20px] py-2 pl-3 pr-16 text-left hover:bg-stone/50">
      <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold", accent ? "border-2 border-forest bg-lime text-forest" : "bg-forest text-cream")}>
        {letter}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-ink-soft">{label}</span>
        <span className={cn("block truncate text-[17px] font-medium", value ? "text-ink" : "text-ink-soft")}>{value ?? placeholder}</span>
        {value && sub && <span className="block truncate text-[12px] text-ink-soft">{sub}</span>}
      </span>
    </button>
  );
}
