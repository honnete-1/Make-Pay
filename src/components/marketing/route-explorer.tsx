"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Clock, Loader2, Route as RouteIcon } from "lucide-react";
import type { FareQuote, RouteSummary } from "@/types";
import { services } from "@/lib/services";
import { SAMPLE_JOURNEYS } from "@/lib/mock-services/fixtures/kigali-graph";
import { SchematicMap } from "@/components/trip/schematic-map";
import { TryMakePayButton } from "@/components/pwa/try-make-pay-button";
import { Eyebrow, Reveal } from "./reveal";
import { formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RouteExplorer() {
  const [selected, setSelected] = useState(0);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [quote, setQuote] = useState<FareQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const journey = SAMPLE_JOURNEYS[selected]!;
  const tariff = services.fare.getTariff();

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    services.routing
      .getRoute(journey.originId, journey.destinationId)
      .then((r) => {
        if (!live) return;
        setRoute(r);
        setQuote(services.fare.quote(r.distanceKm));
      })
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : "Route unavailable"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [journey.originId, journey.destinationId]);

  return (
    <section id="explorer" className="bg-stone py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div>
          <Reveal><Eyebrow>Kigali route explorer</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 className="max-w-3xl font-display text-[clamp(2.5rem,5.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-forest">
              Pick a journey. See the number.
            </h2>
          </Reveal>
        </div>

        <div role="radiogroup" aria-label="Suggested journeys" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {SAMPLE_JOURNEYS.map((j, i) => (
            <button
              key={j.label}
              role="radio"
              aria-checked={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-3 text-[15px] font-medium transition-colors",
                i === selected ? "border-forest bg-forest text-cream" : "border-forest/15 bg-cream text-forest hover:border-forest/40",
              )}
            >
              {j.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid overflow-hidden rounded-[var(--radius-card)] bg-cream shadow-float lg:grid-cols-[1.6fr_1fr]">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
            {route && (
              <SchematicMap
                key={route.id}
                path={route.path}
                originId={route.originId}
                destinationId={route.destinationId}
                ariaLabel={`Route from ${journey.label}`}
              />
            )}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-cream/50 backdrop-blur-[2px]">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-forest shadow-float">
                    <Loader2 className="size-4 animate-spin" /> Calculating route…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="absolute bottom-3 left-4 text-[11px] text-ink-soft">Schematic · not to scale for navigation</p>
          </div>

          <div className="flex flex-col p-7 md:p-10" aria-live="polite">
            {error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                <p className="text-[13px] uppercase tracking-[0.14em] text-ink-soft">Selected journey</p>
                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest">{journey.label.replace("→", "to")}</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Metric icon={RouteIcon} label="Distance" value={route ? `${route.distanceKm.toFixed(1)} km` : "—"} loading={loading} />
                  <Metric icon={Clock} label="Est. ride time" value={route ? `~${route.durationMin} min` : "—"} loading={loading} />
                </div>
                <div className="mt-3 rounded-2xl bg-forest p-6 text-cream">
                  <p className="text-[13px] text-cream/65">Estimated fare</p>
                  <motion.p key={quote?.fare} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-display text-5xl font-semibold tracking-tight text-lime tabular">
                    {quote ? formatRWF(quote.fare) : "—"}
                  </motion.p>
                  {quote && (
                    <dl className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-[13px] text-cream/70 tabular">
                      <div className="flex justify-between"><dt>Base fare · first {tariff.includedKm} km</dt><dd>{formatRWF(quote.baseFare)}</dd></div>
                      <div className="flex justify-between"><dt>{Math.max(0, quote.distanceKm - tariff.includedKm).toFixed(1)} km × {tariff.perKm}</dt><dd>{formatRWF(quote.distanceCharge)}</dd></div>
                      <div className="flex justify-between"><dt>Rounded to nearest {tariff.roundTo}</dt><dd>{formatRWF(quote.fare)}</dd></div>
                    </dl>
                  )}
                </div>
                {route && route.via.length > 0 && (
                  <p className="mt-5 text-[14px] text-ink-soft">via {route.via.join(" · ")}</p>
                )}
                <p className="mt-4 text-[12px] leading-snug text-ink-soft">{tariff.disclaimer}</p>
                <TryMakePayButton size="lg" className="mt-auto self-start" style={{ marginTop: "2rem" }}>
                  Ride this route <ArrowUpRight />
                </TryMakePayButton>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, loading }: { icon: typeof Clock; label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="flex items-center gap-1.5 text-[12px] text-ink-soft"><Icon className="size-3.5" /> {label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold text-ink tabular transition-opacity", loading && "opacity-40")}>{value}</p>
    </div>
  );
}
