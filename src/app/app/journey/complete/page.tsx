"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Clock, Navigation, Plus, Receipt } from "lucide-react";
import { ActionBar, AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { FareBreakdown } from "@/components/trip/fare-breakdown";
import { SchematicMap } from "@/components/trip/schematic-map";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { useHydrated } from "@/hooks/use-hydrated";
import { services } from "@/lib/services";
import { formatMinutes, formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";

export default function CompletedJourneyPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { summary, trip } = useTripStore();
  const tariff = services.fare.getTariff();

  if (!hydrated) return <LoadingScreen />;
  if (!summary || !trip) {
    return (
      <>
        <AppHeader back="/app" title="Journey summary" />
        <EmptyState icon={<Receipt />} title="No completed journey" body="When you end a journey, its summary appears here." action={<Button onClick={() => router.push("/app")}>Plan a journey</Button>} />
      </>
    );
  }

  const origin = services.routing.getPlace(summary.originId)!;
  const destination = services.routing.getPlace(summary.destinationId)!;
  const fareDelta = summary.finalQuote.fare - summary.plannedQuote.fare;
  const endedEarly = summary.travelledKm + 0.05 < trip.totalDistanceKm;

  return (
    <>
      <AppHeader title="Journey complete" />
      <PageColumn>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[var(--radius-card)] bg-forest text-cream">
          <div className="relative h-40">
            <SchematicMap path={trip.path} travelled={trip.path} originId={origin.id} destinationId={destination.id} fitToPath tone="dark" showLabels={false} animateDraw={false} />
          </div>
          <div className="p-6">
            <p className="flex items-center gap-2 text-[13px] text-lime"><CheckCircle2 className="size-4" /> {endedEarly ? "Journey ended early" : "Arrived"}</p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {origin.name} → {destination.name}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="flex items-center gap-1.5 text-[12px] text-cream/60"><Navigation className="size-3.5" /> Distance travelled</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular">{summary.travelledKm.toFixed(1)} km</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="flex items-center gap-1.5 text-[12px] text-cream/60"><Clock className="size-3.5" /> Ride time (simulated)</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular">{formatMinutes(summary.elapsedSec)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {summary.extraKm > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-4 flex gap-3 rounded-2xl bg-lime/50 p-4">
            <Plus className="mt-0.5 size-5 shrink-0 text-forest" />
            <div className="text-[14px] text-forest">
              <p className="font-semibold">Extra distance: +{summary.extraKm.toFixed(1)} km</p>
              <p className="mt-0.5 text-forest/80">
                Planned {summary.plannedDistanceKm.toFixed(1)} km ({formatRWF(summary.plannedQuote.fare)}). The destination was extended, adding {formatRWF(Math.max(0, fareDelta))}.
              </p>
            </div>
          </motion.div>
        )}

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-4 rounded-[var(--radius-card)] bg-white p-6" aria-labelledby="fare-h">
          <div className="flex items-center justify-between">
            <h2 id="fare-h" className="font-display text-xl font-semibold text-forest">Fare summary</h2>
            <DemoTag>{tariff.label}</DemoTag>
          </div>
          <p className="mt-4 font-display text-5xl font-semibold tracking-tight text-forest tabular">{formatRWF(summary.finalQuote.fare)}</p>
          <p className="text-[13px] text-ink-soft">Rider fare for {summary.finalQuote.distanceKm.toFixed(1)} km</p>
          <div className="mt-5 border-t border-stone pt-5">
            <FareBreakdown quote={summary.finalQuote} tariff={tariff} showFee />
          </div>
          <p className="mt-5 text-[12px] leading-snug text-ink-soft">{tariff.disclaimer}</p>
        </motion.section>
      </PageColumn>
      <ActionBar>
        <Button size="xl" block onClick={() => router.push("/app/checkout")}>
          Continue to payment <ArrowRight />
        </Button>
      </ActionBar>
    </>
  );
}
