"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Clock, Route as RouteIcon, RotateCcw } from "lucide-react";
import type { RouteSummary } from "@/types";
import { AppHeader, EmptyState, LoadingScreen } from "@/components/app/app-chrome";
import { BottomSheet } from "./bottom-sheet";
import { RouteMap } from "./route-map";
import { FareBreakdown } from "./fare-breakdown";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { services } from "@/lib/services";
import { formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useHydrated } from "@/hooks/use-hydrated";

export function RoutePreview() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useTripStore();
  const from = params.get("from") ?? store.originId;
  const to = params.get("to") ?? store.destinationId;
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const desktop = useMediaQuery("(min-width: 768px)");
  const hydrated = useHydrated();

  const origin = services.routing.getPlace(from);
  const destination = to ? services.routing.getPlace(to) : undefined;
  const tariff = services.fare.getTariff();

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
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "We couldn’t calculate this route."))
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

  const quote = route ? services.fare.quote(route.distanceKm) : null;
  const padding = useMemo(
    () => (desktop ? { top: 80, bottom: 80, left: 470, right: 80 } : { top: 110, bottom: 400, left: 30, right: 30 }),
    [desktop],
  );

  if (!hydrated) return <LoadingScreen label="Loading route…" />;

  if (!origin || !destination) {
    return (
      <>
        <AppHeader back="/app" title="Route" />
        <EmptyState icon={<RouteIcon />} title="No destination yet" body="Choose where you are going to see the route and an estimated fare." action={<Button onClick={() => router.push("/app")}>Choose destination</Button>} />
      </>
    );
  }

  const start = () => {
    store.startTrip();
    router.push("/app/journey");
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        {route ? (
          <RouteMap path={route.path} origin={{ id: origin.id, coordinate: origin.coordinate }} destination={{ id: destination.id, coordinate: destination.coordinate }} padding={padding} />
        ) : (
          <div className="h-full w-full animate-pulse bg-stone" />
        )}
      </div>
      <AppHeader back="/app" transparent right={<span />} />

      <BottomSheet
        label="Route preview"
        footer={
          <Button size="xl" block disabled={!route || loading} onClick={start}>
            {loading ? "Calculating route…" : <>Start journey <ArrowRight /></>}
          </Button>
        }
        defaultExpanded={desktop}
        peek={
          <div className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">Recommended route</p>
              <DemoTag>Demo route</DemoTag>
            </div>
            <p className="mt-1.5 font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-forest md:text-[1.75rem]">
              {origin.name} <span className="text-ink-soft">→</span> {destination.name}
            </p>
            {error ? (
              <div className="mt-3 rounded-2xl bg-danger/8 p-4 text-danger" role="alert">
                <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" /> Route unavailable</p>
                <p className="mt-1 text-[14px]">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={load}><RotateCcw /> Try again</Button>
              </div>
            ) : (
              <motion.div initial={false} animate={{ opacity: loading ? 0.5 : 1 }} className="mt-3 rounded-[1.5rem] bg-forest p-5 text-cream">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] text-cream/70">Illustrative estimated fare</p>
                  <DemoTag tone="dark">Demo tariff</DemoTag>
                </div>
                <p className="mt-1 font-display text-[2.75rem] font-semibold leading-tight tracking-tight text-lime tabular" aria-live="polite">
                  {quote ? formatRWF(quote.fare) : <span className="inline-block h-11 w-40 animate-pulse rounded-xl bg-white/10" />}
                </p>
                <div className="mt-3 flex gap-5 border-t border-white/10 pt-3 text-[14px] text-cream/80 tabular">
                  <span className="flex items-center gap-1.5"><RouteIcon className="size-4 text-lime" /> {route ? `${route.distanceKm.toFixed(1)} km` : "— km"}</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-4 text-lime" /> {route ? `~${route.durationMin} min` : "— min"}</span>
                </div>
              </motion.div>
            )}
          </div>
        }
      >
        {quote && route && (
          <div className="pb-2">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">How this fare is calculated</h3>
            <div className="mt-3 rounded-2xl bg-white p-4">
              <FareBreakdown quote={quote} tariff={tariff} />
            </div>
            {route.via.length > 0 && (
              <p className="mt-4 text-[14px] text-ink-soft"><span className="font-medium text-ink">Via</span> {route.via.join(" · ")}</p>
            )}
            <p className="mt-2 text-[12px] leading-snug text-ink-soft">{tariff.disclaimer} The final fare follows the distance actually travelled.</p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
