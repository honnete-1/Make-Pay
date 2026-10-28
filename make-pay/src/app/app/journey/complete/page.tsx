"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { ActionBar, AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { FareBreakdown } from "@/components/trip/fare-breakdown";
import { SchematicMap } from "@/components/trip/schematic-map";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { useHydrated } from "@/hooks/use-hydrated";
import { useT } from "@/i18n";
import { services } from "@/lib/services";
import { formatMinutes, formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";

export default function TripSummaryPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const t = useT();
  const { summary, trip } = useTripStore();

  if (!hydrated) return <LoadingScreen />;
  if (!summary || !trip) {
    return (
      <>
        <AppHeader back="/app" title={t.summary.title} />
        <EmptyState icon={<Receipt />} title={t.summary.none} body={t.summary.noneBody} action={<Button onClick={() => router.push("/app")}>{t.journey.plan}</Button>} />
      </>
    );
  }

  const origin = services.routing.getPlace(summary.originId);
  const destination = services.routing.getPlace(summary.destinationId);
  const endedEarly = summary.travelledKm + 0.05 < trip.totalDistanceKm;
  const rows: { k: string; v: string; hi?: boolean }[] = [
    { k: t.summary.planned, v: `${summary.plannedDistanceKm.toFixed(1)} km` },
    { k: t.summary.recorded, v: `${summary.travelledKm.toFixed(1)} km`, hi: true },
    ...(summary.extraKm > 0 ? [{ k: t.summary.extra, v: `+${summary.extraKm.toFixed(1)} km` }] : []),
    { k: t.summary.rideTime, v: formatMinutes(summary.elapsedSec) },
  ];

  return (
    <>
      <AppHeader title={t.summary.title} />
      <PageColumn>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[26px] bg-forest text-cream">
          <div className="relative h-36">
            <SchematicMap path={trip.path} travelled={trip.path} originId={origin?.id} destinationId={destination?.id} fitToPath tone="dark" showLabels={false} animateDraw={false} />
          </div>
          <div className="p-5">
            <p className="flex items-center gap-2 text-[14px] text-lime"><CheckCircle2 className="size-4" /> {endedEarly ? t.summary.endedEarly : t.summary.arrived}</p>
            <p className="mt-1.5 font-display text-[1.7rem] font-semibold leading-tight tracking-tight">
              {origin?.name} → {destination?.name}
            </p>
          </div>
        </motion.div>

        <motion.dl initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mt-4 divide-y divide-stone rounded-[22px] bg-white px-5 text-[15px]">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-ink-soft">{r.k}</dt>
              <dd className={cn("tabular", r.hi ? "text-[18px] font-semibold text-forest" : "text-ink")}>{r.v}</dd>
            </div>
          ))}
        </motion.dl>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-4 rounded-[22px] bg-white p-5" aria-labelledby="fare-h">
          <div className="flex items-center justify-between gap-2">
            <h2 id="fare-h" className="text-[14px] font-medium text-ink-soft">{t.summary.fare}</h2>
            <DemoTag>{t.fare.illustrative}</DemoTag>
          </div>
          <p className="mt-1 font-display text-[3rem] font-semibold leading-none tracking-[-0.04em] text-forest tabular">{formatRWF(summary.finalQuote.fare)}</p>
          <p className="mt-1 text-[13px] text-ink-soft">{t.summary.estimateWas(formatRWF(summary.plannedQuote.fare))}</p>
          <div className="mt-4 border-t border-stone pt-4">
            <FareBreakdown quote={summary.finalQuote} tariff={services.fare.getTariff()} showFee />
          </div>
          <p className="mt-4 text-[12px] leading-snug text-ink-soft">{t.fare.disclaimer}</p>
        </motion.section>
      </PageColumn>
      <ActionBar>
        <Button size="xl" block onClick={() => router.push("/app/checkout")}>
          {t.summary.pay} · {formatRWF(summary.finalQuote.total)} <ArrowRight />
        </Button>
      </ActionBar>
    </>
  );
}
