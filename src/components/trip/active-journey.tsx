"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import { Clock, Flag, Gauge, Loader2, MapPinPlus, Navigation, Signal, SignalLow, WifiOff, X } from "lucide-react";
import type { GpsSignal, Place } from "@/types";
import { AppHeader, EmptyState, LoadingScreen } from "@/components/app/app-chrome";
import { BottomSheet } from "./bottom-sheet";
import { RouteMap } from "./route-map";
import { PlaceRow } from "./place-picker";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/ui/demo-tag";
import { useHydrated } from "@/hooks/use-hydrated";
import { useOnline } from "@/hooks/use-online";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTripSimulation } from "@/hooks/use-trip-simulation";
import { services } from "@/lib/services";
import { finalDestinationId } from "@/lib/mock-services/trip-simulator";
import { pointAlong } from "@/lib/geo";
import { formatDuration, formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";

const SIGNAL: Record<GpsSignal, { label: string; cls: string; Icon: typeof Signal }> = {
  strong: { label: "Simulated GPS · Strong", cls: "bg-white text-forest", Icon: Signal },
  weak: { label: "Simulated GPS · Weak signal", cls: "bg-warning text-white", Icon: SignalLow },
  searching: { label: "Simulated GPS · Locating…", cls: "bg-white text-ink-soft", Icon: Loader2 },
  offline: { label: "Offline · estimating on device", cls: "bg-ink text-cream", Icon: WifiOff },
};

export function ActiveJourney() {
  const hydrated = useHydrated();
  const router = useRouter();
  const online = useOnline();
  const desktop = useMediaQuery("(min-width: 768px)");
  const { trip, endTrip, extend, demoSpeed, setDemoSpeed } = useTripStore();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);

  useTripSimulation(hydrated && trip?.status === "active");

  useEffect(() => {
    if (hydrated && trip?.status === "completed") router.replace("/app/journey/complete");
  }, [hydrated, trip?.status, router]);

  const progress = trip ? trip.travelledKm / trip.totalDistanceKm : 0;
  const along = useMemo(() => (trip ? pointAlong(trip.path, progress) : null), [trip, progress]);
  const padding = useMemo(
    () => (desktop ? { top: 80, bottom: 80, left: 470, right: 80 } : { top: 110, bottom: 430, left: 30, right: 30 }),
    [desktop],
  );

  if (!hydrated) return <LoadingScreen label="Resuming journey…" />;
  if (!trip || trip.status === "completed") {
    return (
      <>
        <AppHeader back="/app" title="Journey" />
        <EmptyState icon={<Navigation />} title="No active journey" body="Choose a destination and start a journey to see live tracking." action={<Button onClick={() => router.push("/app")}>Plan a journey</Button>} />
      </>
    );
  }

  const origin = services.routing.getPlace(trip.route.originId)!;
  const destId = finalDestinationId(trip);
  const destination = services.routing.getPlace(destId)!;
  const running = services.fare.quote(trip.travelledKm);
  const arrived = trip.status === "arrived";
  const signal = services.location.signalAt(progress, online);
  const S = SIGNAL[signal];
  const remainingKm = Math.max(0, trip.totalDistanceKm - trip.travelledKm);

  const finish = () => {
    endTrip();
    router.push("/app/journey/complete");
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <RouteMap
          path={trip.path}
          travelled={along?.travelled}
          position={along?.point}
          origin={{ id: origin.id, coordinate: origin.coordinate }}
          destination={{ id: destination.id, coordinate: destination.coordinate }}
          padding={padding}
        />
      </div>
      <AppHeader
        back="/app"
        transparent
        right={
          <span role="status" className={cn("flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium shadow-float", S.cls)}>
            <S.Icon className={cn("size-3.5", signal === "searching" && "animate-spin")} aria-hidden /> {S.label}
          </span>
        }
      />

      <BottomSheet
        label="Active journey"
        defaultExpanded={false}
        footer={
        <div className="pb-1">
          <AnimatePresence mode="wait" initial={false}>
            {confirmEnd && !arrived ? (
              <motion.div key="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-white p-4">
                <p className="font-medium text-ink">End the journey before {destination.name}?</p>
                <p className="mt-1 text-[13px] text-ink-soft">The fare will be based on the {trip.travelledKm.toFixed(1)} km travelled so far.</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmEnd(false)}>Keep riding</Button>
                  <Button variant="danger" className="flex-1" onClick={finish}>End now</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                <Button size="xl" variant="outline" onClick={() => setExtendOpen(true)} className="shrink-0 px-5" aria-label={arrived ? "Continue further" : "Change destination"}>
                  <MapPinPlus />
                  <span className="hidden min-[380px]:inline">{arrived ? "Further" : "Extend"}</span>
                </Button>
                <Button size="xl" block variant={arrived ? "primary" : "outline"} onClick={() => (arrived ? finish() : setConfirmEnd(true))} className={cn(!arrived && "border-forest text-forest")}>
                  <Flag /> End journey
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        }
        peek={
          <div className="pb-3">
            <AnimatePresence>
              {arrived && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <div className="mb-3 flex items-center gap-3 rounded-2xl bg-lime px-4 py-3 text-forest">
                    <Flag className="size-5" />
                    <p className="text-[15px] font-semibold">You’ve arrived at {destination.name}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">Running fare</p>
                <p className="font-display text-[3.4rem] font-semibold leading-none tracking-[-0.04em] text-forest tabular" aria-live="off">
                  {formatRWF(running.fare, false)}
                  <span className="ml-1.5 text-lg font-medium text-ink-soft">RWF</span>
                </p>
              </div>
              <DemoTag className="mb-1.5">Illustrative</DemoTag>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Journey progress">
              <div className="h-full rounded-full bg-forest transition-[width] duration-300 ease-linear" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric icon={Navigation} label="Travelled" value={`${trip.travelledKm.toFixed(1)} km`} />
              <Metric icon={Clock} label="Elapsed" value={formatDuration(trip.elapsedSec)} />
              <Metric icon={Flag} label="Remaining" value={`${remainingKm.toFixed(1)} km`} />
            </div>
          </div>
        }
      >
        <div className="rounded-2xl bg-white p-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1.5" aria-hidden>
              <span className="size-3 rounded-full border-[3px] border-forest" />
              <span className="my-1 w-px flex-1 bg-stone-dark" />
              <span className="size-3 rounded-full bg-lime ring-2 ring-forest" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[12px] text-ink-soft">From</p>
                <p className="text-[15px] font-medium text-ink">{origin.name} · <span className="font-normal text-ink-soft">{origin.area}</span></p>
              </div>
              <div>
                <p className="text-[12px] text-ink-soft">To {trip.extensions.length > 0 && <span className="ml-1 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-forest">Extended</span>}</p>
                <p className="text-[15px] font-medium text-ink">{destination.name} · <span className="font-normal text-ink-soft">{destination.area}</span></p>
              </div>
            </div>
          </div>
          {trip.extensions.length > 0 && (
            <p className="mt-3 border-t border-stone pt-3 text-[13px] text-ink-soft">
              Planned {trip.plannedDistanceKm.toFixed(1)} km · now {trip.totalDistanceKm.toFixed(1)} km (+{(trip.totalDistanceKm - trip.plannedDistanceKm).toFixed(1)} km)
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white p-3 pl-4">
          <span className="text-[14px] text-ink">Demo speed</span>
          <div role="radiogroup" aria-label="Demo speed" className="flex rounded-full bg-stone p-1">
            {([1, 2] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={demoSpeed === v} onClick={() => setDemoSpeed(v)} className={cn("flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-medium", demoSpeed === v ? "bg-white text-forest shadow-sm" : "text-ink-soft")}>
                <Gauge className="size-3.5" /> {v}×
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[12px] text-ink-soft">Time is compressed for the demo: 1 second ≈ {30 * demoSpeed} seconds of riding. No real GPS is used.</p>

      </BottomSheet>

      <ExtendDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        fromId={destId}
        exclude={[trip.route.originId, ...trip.extensions.map((e) => e.originId)]}
        onChoose={async (p) => {
          const ext = await services.routing.getRoute(destId, p.id);
          extend(ext);
          setExtendOpen(false);
        }}
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11px] text-ink-soft"><Icon className="size-3" aria-hidden /> {label}</p>
      <p className="mt-0.5 text-[17px] font-semibold text-ink tabular">{value}</p>
    </div>
  );
}

function ExtendDialog({
  open,
  onOpenChange,
  fromId,
  exclude,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fromId: string;
  exclude: string[];
  onChoose: (p: Place) => Promise<void>;
}) {
  const [options, setOptions] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const from = services.routing.getPlace(fromId);
  const excludeKey = exclude.join(",");

  useEffect(() => {
    if (!open) return;
    setOptions(null);
    services.routing.getExtensionOptions(fromId, excludeKey.split(",")).then(setOptions);
  }, [open, fromId, excludeKey]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-[var(--radius-sheet)] bg-cream p-5 safe-bottom md:inset-auto md:left-1/2 md:top-1/2 md:w-[460px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-sheet)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl font-semibold text-forest">Extend your destination</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-soft">
                The ride continues from {from?.name}. Extra distance is added and itemised on your summary.
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label="Close"><X className="size-4" /></Dialog.Close>
          </div>
          <div className="mt-4 space-y-0.5">
            {!options && <div className="flex items-center gap-2 px-3 py-6 text-ink-soft"><Loader2 className="size-4 animate-spin" /> Finding nearby demo places…</div>}
            {options?.length === 0 && <p className="px-3 py-6 text-ink-soft">No nearby demo places to extend to.</p>}
            {options?.map((p) => (
              <PlaceRow
                key={p.id}
                place={p}
                hint={busy === p.id ? "Recalculating route…" : p.area}
                disabled={!!busy}
                onSelect={async (pl) => {
                  setBusy(pl.id);
                  try { await onChoose(pl); } finally { setBusy(null); }
                }}
              />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
