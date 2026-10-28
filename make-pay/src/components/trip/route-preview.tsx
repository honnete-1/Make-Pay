"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Clock, Info, RotateCcw, Route as RouteIcon } from "lucide-react";
import type { RouteSummary } from "@/types";
import { AppHeader, EmptyState, LoadingScreen } from "@/components/app/app-chrome";
import { BottomSheet } from "./bottom-sheet";
import { TripMap } from "./trip-map";
import { FareBreakdown } from "./fare-breakdown";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { services } from "@/lib/services";
import { formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useT } from "@/i18n";

const MAP_PADDING = { top: 90, bottom: 380, left: 40, right: 40 };

export function RoutePreview() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useT();
  const store = useTripStore();
  const hydrated = useHydrated();
  const from = params.get("from") ?? store.originId;
  const to = params.get("to") ?? store.destinationId;
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const origin = hydrated ? services.routing.getPlace(from) : undefined;
  const destination = hydrated ? services.routing.getPlace(to) : undefined;

  const load = useCallback(() => {
    if (!origin || !destination) return;
    setLoading(true);
    setError(null);
    services.routing
      .getRoute(origin.id, destination.id)
      .then((r) => {
        setRoute(r);
        useTripStore.getState().setRoute(r);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "route-unavailable"))
      .finally(() => setLoading(false));
  }, [origin, destination]);

  useEffect(() => {
    if (!hydrated) return;
    if (origin && destination) {
      const s = useTripStore.getState();
      if (s.originId !== origin.id) s.setOrigin(origin.id);
      if (s.destinationId !== destination.id) s.setDestination(destination.id);
    }
    load();
  }, [hydrated, origin, destination, load]);

  // The fare always comes from the fare engine — never a hard-coded amount.
  const quote = route ? services.fare.quote(route.distanceKm) : null;
  const ends = useMemo(
    () => (origin && destination ? { a: { id: origin.id, coordinate: origin.coordinate }, b: { id: destination.id, coordinate: destination.coordinate } } : null),
    [origin, destination],
  );

  if (!hydrated) return <LoadingScreen />;
  if (!origin || !destination || !ends) {
    return (
      <>
        <AppHeader back="/app" title={t.route.title} />
        <EmptyState icon={<RouteIcon />} title={t.home.chooseBoth} body={t.route.unavailableBody} action={<Button onClick={() => router.push("/app")}>{t.route.changePlaces}</Button>} />
      </>
    );
  }

  const start = () => {
    store.startTrip();
    router.push("/app/journey");
  };

  const sourceLabel = route?.source === "google" ? t.route.recommendedGoogle : t.route.demoRoute;

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        {route ? <TripMap path={route.path} origin={ends.a} destination={ends.b} padding={MAP_PADDING} /> : <div className="h-full w-full animate-pulse bg-stone" />}
      </div>
      <AppHeader back="/app" transparent />

      <BottomSheet
        label={t.route.title}
        footer={
          <Button size="xl" block disabled={!route || loading || !!error} onClick={start}>
            {loading ? t.route.calculating : <>{t.route.start} <ArrowRight /></>}
          </Button>
        }
        peek={
          <div className="pb-3">
            {/* A → B */}
            <div className="flex items-center gap-2 text-[15px] text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-forest text-[11px] font-bold text-cream">A</span>
              <span className="min-w-0 truncate font-medium">{origin.name}</span>
              <ArrowRight className="size-4 shrink-0 text-ink-soft" />
              <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-forest bg-lime text-[11px] font-bold text-forest">B</span>
              <span className="min-w-0 truncate font-medium">{destination.name}</span>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl bg-danger/8 p-4 text-danger" role="alert">
                <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" /> {error === "same-place" ? t.home.sameplace : t.route.unavailable}</p>
                <p className="mt-1 text-[14px]">{t.route.unavailableBody}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={load}><RotateCcw /> {t.common.tryAgain}</Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/app")}>{t.route.changePlaces}</Button>
                </div>
              </div>
            ) : (
              <motion.div initial={false} animate={{ opacity: loading ? 0.45 : 1 }}>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink-soft">{t.route.estimatedFare}</p>
                    <p className="font-display text-[3rem] font-semibold leading-none tracking-[-0.04em] text-forest tabular" aria-live="polite">
                      {quote ? formatRWF(quote.fare, false) : "—"}
                      <span className="ml-1.5 text-lg font-medium text-ink-soft">RWF</span>
                    </p>
                  </div>
                  <DemoTag className="mb-1">{t.fare.illustrative}</DemoTag>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Stat icon={<RouteIcon className="size-4" />} label={t.route.distance} value={route ? `${route.distanceKm.toFixed(1)} km` : "—"} />
                  <Stat icon={<Clock className="size-4" />} label={t.route.duration} value={route ? t.common.minutes(route.durationMin) : "—"} />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-soft">
                  <span className={route?.source === "google" ? "size-2 rounded-full bg-success" : "size-2 rounded-full bg-warning"} aria-hidden />
                  {loading ? t.route.calculating : sourceLabel}
                </p>
                {route?.fellBack && <p className="mt-2 rounded-xl bg-warning/10 px-3 py-2 text-[13px] text-ink">{t.route.googleFallback}</p>}
              </motion.div>
            )}
          </div>
        }
      >
        {quote && route && (
          <div className="space-y-4 pb-2">
            {route.via.length > 0 && (
              <p className="text-[15px] text-ink">
                <span className="font-medium">{t.route.via}</span> <span className="text-ink-soft">{route.via.join(" · ")}</span>
              </p>
            )}
            <div>
              <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.route.howCalculated}</h3>
              <div className="mt-2 rounded-2xl bg-white p-4">
                <FareBreakdown quote={quote} tariff={services.fare.getTariff()} />
              </div>
            </div>
            {route.warnings && route.warnings.length > 0 && (
              <div className="rounded-2xl bg-warning/10 p-4 text-[13px] text-ink">
                <p className="font-semibold">{t.route.warnings}</p>
                <ul className="mt-1 list-disc pl-4">{route.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            )}
            <p className="flex gap-2 text-[13px] leading-snug text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>{t.fare.disclaimer} {t.route.finalFollows} {t.route.notShortest}</span>
            </p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="flex items-center gap-1.5 text-[12px] text-ink-soft">{icon} {label}</p>
      <p className="mt-0.5 text-[20px] font-semibold text-ink tabular">{value}</p>
    </div>
  );
}
