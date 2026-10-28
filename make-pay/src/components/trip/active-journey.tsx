"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import { Flag, Gauge, Loader2, MapPinned, Navigation, Search, Signal, SignalLow, WifiOff, X } from "lucide-react";
import type { GpsSignal, LngLat, Place } from "@/types";
import { AppHeader, EmptyState, LoadingScreen } from "@/components/app/app-chrome";
import { BottomSheet } from "./bottom-sheet";
import { TripMap } from "./trip-map";
import { PlaceRow, PlaceSearchSheet } from "./place-picker";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { useHydrated } from "@/hooks/use-hydrated";
import { useOnline } from "@/hooks/use-online";
import { useTripSimulation } from "@/hooks/use-trip-simulation";
import { useT } from "@/i18n";
import { services } from "@/lib/services";
import { finalDestinationId, SIM_TIME_SCALE, tripPosition } from "@/lib/mock-services/trip-simulator";
import { formatDuration, formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";

const SIGNAL: Record<GpsSignal, { cls: string; Icon: typeof Signal }> = {
  strong: { cls: "bg-white text-forest", Icon: Signal },
  weak: { cls: "bg-warning text-white", Icon: SignalLow },
  searching: { cls: "bg-white text-ink-soft", Icon: Loader2 },
  offline: { cls: "bg-ink text-cream", Icon: WifiOff },
};
const MAP_PADDING = { top: 120, bottom: 430, left: 40, right: 40 };
const ALMOST_KM = 0.4;

export function ActiveJourney() {
  const hydrated = useHydrated();
  const router = useRouter();
  const online = useOnline();
  const t = useT();
  const { trip, endTrip, redirect, keepRiding, demoSpeed, setDemoSpeed } = useTripStore();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [nextOpen, setNextOpen] = useState(false);

  useTripSimulation(hydrated && trip?.status === "active");

  useEffect(() => {
    if (hydrated && trip?.status === "completed") router.replace("/app/journey/complete");
  }, [hydrated, trip?.status, router]);

  const pos = useMemo(() => (trip ? tripPosition(trip) : null), [trip]);

  if (!hydrated) return <LoadingScreen />;
  if (!trip || trip.status === "completed" || !pos) {
    return (
      <>
        <AppHeader back="/app" title={t.journey.title} />
        <EmptyState icon={<Navigation />} title={t.journey.none} body={t.journey.noneBody} action={<Button onClick={() => router.push("/app")}>{t.journey.plan}</Button>} />
      </>
    );
  }

  const origin = services.routing.getPlace(trip.route.originId);
  const destId = finalDestinationId(trip);
  const destination = services.routing.getPlace(destId);
  const running = services.fare.quote(trip.travelledKm);
  const estimate = services.fare.quote(trip.plannedDistanceKm);
  const remainingKm = Math.max(0, trip.totalDistanceKm - trip.travelledKm);
  const atEnd = remainingKm < 1e-6;
  const arrived = trip.status === "arrived";
  const waiting = trip.continuing && atEnd;
  const extraKm = Math.max(0, trip.travelledKm - trip.plannedDistanceKm);
  const progress = trip.totalDistanceKm > 0 ? trip.travelledKm / trip.totalDistanceKm : 0;
  const signal = services.location.signalAt(progress, online);
  const S = SIGNAL[signal];
  const status = arrived ? t.journey.status.arrived : waiting ? t.journey.status.waiting : t.journey.status.riding;

  const finish = () => {
    endTrip();
    router.push("/app/journey/complete");
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <TripMap
          path={trip.path}
          travelled={pos.travelled}
          position={pos.point}
          origin={origin ? { id: origin.id, coordinate: origin.coordinate } : undefined}
          destination={destination ? { id: destination.id, coordinate: destination.coordinate } : undefined}
          padding={MAP_PADDING}
        />
      </div>
      <AppHeader back="/app" transparent />
      <span role="status" className={cn("absolute left-4 top-[76px] z-20 flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium shadow-float", S.cls)}>
        <S.Icon className={cn("size-3.5", signal === "searching" && "animate-spin")} aria-hidden /> {t.journey.gps[signal]}
      </span>

      <BottomSheet
        label={t.journey.title}
        footer={
          <AnimatePresence mode="wait" initial={false}>
            {arrived || waiting ? (
              <motion.div key="arrived" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-2">
                <Button size="xl" variant="outline" className="border-forest px-3 text-forest" onClick={() => setNextOpen(true)}>
                  <MapPinned /> <span className="truncate">{waiting ? t.journey.chooseNext : t.journey.continue}</span>
                </Button>
                <Button size="xl" className="px-3" onClick={finish}>
                  <Flag /> <span className="truncate">{t.journey.end}</span>
                </Button>
              </motion.div>
            ) : confirmEnd ? (
              <motion.div key="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-white p-4" role="alertdialog" aria-label={t.journey.endEarlyTitle(destination?.name ?? "")}>
                <p className="font-semibold text-ink">{t.journey.endEarlyTitle(destination?.name ?? "")}</p>
                <p className="mt-1 text-[14px] text-ink-soft">{t.journey.endEarlyBody(trip.travelledKm.toFixed(1))}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="lg" onClick={() => setConfirmEnd(false)}>{t.journey.keepRiding}</Button>
                  <Button size="lg" onClick={finish}>{t.journey.endNow}</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="riding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-[auto_1fr] gap-2">
                <Button size="xl" variant="outline" onClick={() => setNextOpen(true)} className="px-4" aria-label={t.journey.change}>
                  <MapPinned />
                </Button>
                <Button size="xl" block variant="outline" onClick={() => setConfirmEnd(true)} className="border-forest text-forest">
                  <Flag /> {t.journey.end}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        }
        peek={
          <div className="pb-3">
            <AnimatePresence initial={false}>
              {arrived && (
                <motion.div key="arrived" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mb-3 rounded-2xl bg-lime px-4 py-3 text-forest" role="status">
                    <p className="text-[16px] font-semibold">{t.journey.arrivedTitle}</p>
                    <p className="mt-0.5 text-[14px] text-forest/80">{t.journey.arrivedBody(destination?.name ?? "")}</p>
                  </div>
                </motion.div>
              )}
              {waiting && (
                <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 rounded-2xl bg-warning/10 px-4 py-3 text-[14px] text-ink" role="status">
                  {t.journey.pausedNote}
                </motion.p>
              )}
              {!arrived && !waiting && remainingKm < ALMOST_KM && (
                <motion.p key="almost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-2 text-[14px] font-medium text-forest">
                  {t.journey.almost(destination?.name ?? "")}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                <span className={cn("size-2 rounded-full", arrived ? "bg-lime ring-2 ring-forest" : waiting ? "bg-warning" : "animate-pulse bg-success")} aria-hidden />
                {status}
              </p>
              <DemoTag>{t.journey.demoLabel}</DemoTag>
            </div>

            <p className="mt-2 text-[13px] font-medium text-ink-soft">{t.journey.running}</p>
            <p className="font-display text-[3.6rem] font-semibold leading-none tracking-[-0.045em] text-forest tabular" aria-live="off">
              {formatRWF(running.fare, false)}
              <span className="ml-1.5 text-xl font-medium text-ink-soft">RWF</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">{t.journey.estimated(formatRWF(estimate.fare))}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label={t.journey.travelled} value={`${trip.travelledKm.toFixed(1)} km`} strong />
              <Metric label={t.journey.elapsed} value={formatDuration(trip.elapsedSec)} />
              <Metric label={extraKm > 0.05 && atEnd ? t.summary.extra : t.journey.remaining} value={extraKm > 0.05 && atEnd ? `+${extraKm.toFixed(1)} km` : `${remainingKm.toFixed(1)} km`} />
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-forest bg-lime text-[12px] font-bold text-forest">B</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-ink-soft">
                  {t.journey.to}
                  {trip.extensions.length > 0 && <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-forest">{t.journey.extended}</span>}
                </p>
                <p className="truncate text-[16px] font-semibold text-ink">{destination?.name ?? "—"}</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 text-[14px]">
            <p className="text-ink-soft">{t.journey.from}</p>
            <p className="font-medium text-ink">{origin?.name}</p>
            {extraKm > 0.05 && <p className="mt-2 border-t border-stone pt-2 text-ink-soft">{t.journey.extraSoFar(extraKm.toFixed(1))}</p>}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 pl-4">
            <span className="text-[14px] text-ink">{t.journey.speed}</span>
            <div role="radiogroup" aria-label={t.journey.speed} className="flex rounded-full bg-stone p-1">
              {([1, 2] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={demoSpeed === v} onClick={() => setDemoSpeed(v)} className={cn("flex h-10 items-center gap-1 rounded-full px-4 text-[14px] font-medium", demoSpeed === v ? "bg-white text-forest shadow-sm" : "text-ink-soft")}>
                  <Gauge className="size-3.5" /> {v}×
                </button>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-ink-soft">{t.journey.speedNote(SIM_TIME_SCALE * demoSpeed)}</p>
        </div>
      </BottomSheet>

      <NextDestinationSheet
        open={nextOpen}
        onOpenChange={setNextOpen}
        fromId={destId}
        here={pos.point}
        allowKeepRiding={atEnd && !waiting}
        onKeepRiding={() => {
          keepRiding();
          setNextOpen(false);
        }}
        onRoute={(route) => {
          redirect(route);
          setConfirmEnd(false);
          setNextOpen(false);
        }}
      />
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-2xl px-3 py-2.5", strong ? "bg-forest text-cream" : "bg-white")}>
      <p className={cn("truncate text-[11px]", strong ? "text-cream/70" : "text-ink-soft")}>{label}</p>
      <p className={cn("mt-0.5 text-[18px] font-semibold tabular", strong ? "text-lime" : "text-ink")}>{value}</p>
    </div>
  );
}

/**
 * "Where to now?" — continue past the destination or change it mid-ride.
 * The new route starts at the rider's current position; recorded distance is
 * kept and only the new distance is added.
 */
function NextDestinationSheet({
  open,
  onOpenChange,
  fromId,
  here,
  allowKeepRiding,
  onKeepRiding,
  onRoute,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fromId: string;
  here: LngLat;
  allowKeepRiding: boolean;
  onKeepRiding: () => void;
  onRoute: (route: Awaited<ReturnType<typeof services.routing.getRouteFromPoint>>) => void;
}) {
  const t = useT();
  const [options, setOptions] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOptions(null);
    setFailed(false);
    const from = services.routing.getPlace(fromId);
    // Areas like Remera suggest their own precise spots first.
    const area = from?.parentId ? services.routing.getPlace(from.parentId) : from;
    const inArea = (area?.childIds ?? []).map((id) => services.routing.getPlace(id)).filter((p): p is Place => !!p && p.id !== fromId);
    services.routing
      .getExtensionOptions(fromId, [fromId])
      .catch(() => [] as Place[])
      .then((near) => setOptions([...inArea, ...near.filter((n) => !inArea.some((a) => a.id === n.id))].slice(0, 5)));
  }, [open, fromId]);

  const go = async (p: Place) => {
    setBusy(p.id);
    setFailed(false);
    try {
      onRoute(await services.routing.getRouteFromPoint(here, p.id));
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Dialog.Root open={open && !searchOpen} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88svh] max-w-[480px] overflow-y-auto rounded-t-[28px] bg-cream p-5 safe-bottom md:bottom-6 md:rounded-[28px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-2xl font-semibold text-forest">{t.journey.nextTitle}</Dialog.Title>
                <Dialog.Description className="mt-1 text-[14px] text-ink-soft">{t.journey.nextHint}</Dialog.Description>
              </div>
              <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label={t.common.close}><X className="size-4" /></Dialog.Close>
            </div>
            {busy && !options?.some((o) => o.id === busy) && (
              <p role="status" className="mt-3 flex items-center gap-2 text-[14px] text-forest"><Loader2 className="size-4 animate-spin" /> {t.journey.recalculating}</p>
            )}
            {failed && <p role="alert" className="mt-3 rounded-2xl bg-danger/8 px-4 py-3 text-[14px] text-danger">{t.route.unavailable} · {t.route.unavailableBody}</p>}
            <p className="mt-5 px-3 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.journey.nearby}</p>
            <div className="mt-1">
              {!options && <div className="flex items-center gap-2 px-3 py-6 text-ink-soft"><Loader2 className="size-4 animate-spin" /> {t.common.loading}</div>}
              {options?.map((p) => (
                <PlaceRow key={p.id} place={p} hint={busy === p.id ? t.journey.recalculating : p.area} disabled={!!busy} onSelect={go} />
              ))}
              <button type="button" onClick={() => setSearchOpen(true)} disabled={!!busy} className="flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left hover:bg-stone/70">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-lime"><Search className="size-4" /></span>
                <span className="text-[16px] font-medium text-forest">{t.home.toPlaceholder}</span>
              </button>
            </div>
            {allowKeepRiding && (
              <Button variant="ghost" size="lg" block className="mt-3" onClick={onKeepRiding} disabled={!!busy}>
                {t.journey.continueWithout}
              </Button>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <PlaceSearchSheet
        open={searchOpen}
        onOpenChange={setSearchOpen}
        mode="to"
        otherId={fromId}
        onPick={(p) => {
          setSearchOpen(false);
          void go(p);
        }}
      />
    </>
  );
}
