"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronRight, Crosshair, Loader2, MapPin, Search, Star, X } from "lucide-react";
import type { Place } from "@/types";
import { services } from "@/lib/services";
import { GOOGLE_ENABLED, KIGALI_BOUNDS } from "@/lib/maps/config";
import { POPULAR_PLACE_IDS, PLACES } from "@/lib/mock-services/fixtures/kigali-graph";
import { haversineKm } from "@/lib/geo";
import { useT, type Dictionary } from "@/i18n";
import { useTripStore } from "@/store/trip-store";
import { cn } from "@/lib/utils";

/** Debounced place search backed by the routing service (demo + Google when configured). */
export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    setLoading(true);
    const t = setTimeout(() => {
      services.routing
        .searchPlaces(query)
        .then((r) => live && (setResults(r), setError(false)))
        .catch(() => live && setError(true))
        .finally(() => live && setLoading(false));
    }, GOOGLE_ENABLED ? 260 : 140);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query]);
  return { results, loading, error };
}

export function PlaceRow({
  place,
  selected,
  disabled,
  onSelect,
  hint,
  icon,
  trailing,
}: {
  place: Place;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (p: Place) => void;
  hint?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(place)}
      className={cn(
        "flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition-colors disabled:opacity-40",
        selected ? "bg-lime/60" : "hover:bg-stone/70 active:bg-stone",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", selected ? "bg-forest text-lime" : "bg-white text-forest shadow-[0_1px_0_rgb(23_60_50/0.06)]")}>
        {selected ? <Check className="size-4" /> : icon ?? <MapPin className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-ink">{place.name}</span>
        <span className="block truncate text-[13px] text-ink-soft">{hint ?? place.area}</span>
      </span>
      {trailing}
    </button>
  );
}

type Located = { place: Place; note?: string };

/**
 * Ask the device for its position. Inside Kigali: with Google we route from the
 * exact point; in demo mode we start from the nearest demo landmark and say so.
 */
async function locateDevice(t: Dictionary): Promise<Located> {
  if (!("geolocation" in navigator)) throw new Error("denied");
  const pos = await new Promise<GeolocationPosition>((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }),
  ).catch(() => {
    throw new Error("denied");
  });
  const { latitude: lat, longitude: lng } = pos.coords;
  const b = KIGALI_BOUNDS;
  if (lat < b.south || lat > b.north || lng < b.west || lng > b.east) throw new Error("outside");
  if (GOOGLE_ENABLED) {
    const place: Place = { id: `here:${lat.toFixed(5)},${lng.toFixed(5)}`, name: t.home.myLocation, area: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coordinate: [lng, lat], keywords: [] };
    return { place };
  }
  const nearest = [...PLACES].sort((x, y) => haversineKm([lng, lat], x.coordinate) - haversineKm([lng, lat], y.coordinate))[0]!;
  return { place: nearest, note: t.home.locationDemoNear(nearest.name) };
}

/**
 * Full-height search sheet for the starting point or destination. Handles
 * typing, popular landmarks, recent places, device location and — for broad
 * areas like Remera — a second step to confirm the precise spot.
 */
export function PlaceSearchSheet({
  open,
  onOpenChange,
  mode,
  selectedId,
  otherId,
  onPick,
  startArea,
}: {
  /** Open directly on the "Where in …?" step for this area. */
  startArea?: Place | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "from" | "to";
  selectedId?: string | null;
  otherId?: string | null;
  onPick: (p: Place, note?: string) => void;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const [area, setArea] = useState<Place | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { results, loading, error } = usePlaceSearch(q);
  const recent = useTripStore((s) => s.recentDestinations);
  const savePlace = useTripStore((s) => s.savePlace);
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setArea(startArea ?? null);
    setMessage(null);
    setBusy(null);
  }, [open, startArea]);

  const finish = (p: Place, note?: string) => {
    savePlace(p);
    onPick(p, note);
    onOpenChange(false);
  };

  const choose = async (p: Place) => {
    setMessage(null);
    if (p.childIds?.length) {
      setArea(p);
      return;
    }
    if (p.pending) {
      setBusy(p.id);
      try {
        finish(await services.routing.resolvePlace(p));
      } catch {
        setMessage(t.home.searchError);
      } finally {
        setBusy(null);
      }
      return;
    }
    finish(p);
  };

  const locate = async () => {
    setBusy("here");
    setMessage(null);
    try {
      const { place, note } = await locateDevice(t);
      finish(place, note);
    } catch (e) {
      setMessage((e as Error).message === "outside" ? t.home.outsideKigali : t.home.locationDenied);
    } finally {
      setBusy(null);
    }
  };

  const popular = POPULAR_PLACE_IDS.map((id) => services.routing.getPlace(id)!).filter(Boolean);
  const recentPlaces = recent.map((id) => services.routing.getPlace(id)).filter((p): p is Place => !!p).slice(0, 3);
  const row = (p: Place, icon?: React.ReactNode) => (
    <PlaceRow
      key={p.id}
      place={p}
      icon={icon}
      selected={p.id === selectedId}
      disabled={p.id === otherId || (!!busy && busy !== p.id)}
      hint={busy === p.id ? t.common.loading : p.id === otherId ? (mode === "to" ? t.home.yourStart : t.home.sameplace) : undefined}
      trailing={p.childIds?.length ? <ChevronRight className="size-4 text-ink-soft" /> : undefined}
      onSelect={choose}
    />
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                input.current?.focus();
              }}
            >
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92svh] max-w-[480px] flex-col rounded-t-[28px] bg-cream md:bottom-6 md:h-[min(88svh,760px)] md:rounded-[28px]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
              >
                <div className="flex items-center gap-3 px-5 pb-2 pt-5">
                  {area && (
                    <button type="button" onClick={() => setArea(null)} className="grid size-10 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label={t.common.back}>
                      <ArrowLeft className="size-4" />
                    </button>
                  )}
                  <Dialog.Title className="min-w-0 flex-1 truncate font-display text-2xl font-semibold text-forest">
                    {area ? t.precise.title(area.name) : mode === "from" ? t.home.from : t.home.to}
                  </Dialog.Title>
                  <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label={t.common.close}>
                    <X className="size-4" />
                  </Dialog.Close>
                </div>

                {area ? (
                  <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-8">
                    <p className="px-3 pb-3 text-[15px] text-ink-soft">{t.precise.hint}</p>
                    {area.childIds!.map((id) => services.routing.getPlace(id)).filter((p): p is Place => !!p).map((p) => row(p))}
                    <PlaceRow place={area} hint={t.precise.whole(area.name)} selected={area.id === selectedId} disabled={area.id === otherId} onSelect={finish} icon={<Star className="size-4" />} />
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-2">
                      <label htmlFor={inputId} className="sr-only">{mode === "from" ? t.home.from : t.home.to}</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-forest" aria-hidden />
                        <input
                          ref={input}
                          id={inputId}
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder={mode === "from" ? t.home.fromPlaceholder : t.home.toPlaceholder}
                          autoComplete="off"
                          enterKeyHint="search"
                          className="h-14 w-full rounded-2xl bg-white pl-12 pr-11 text-[17px] text-ink outline-none ring-forest/20 placeholder:text-ink-soft focus:ring-4"
                        />
                        {loading && q && <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-soft" />}
                      </div>
                    </div>
                    {message && (
                      <p role="alert" className="mx-5 mt-1 rounded-2xl bg-warning/10 px-4 py-3 text-[14px] text-ink">{message}</p>
                    )}
                    <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-8 pt-2">
                      {mode === "from" && !q && (
                        <button
                          type="button"
                          onClick={locate}
                          disabled={!!busy}
                          className="flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left hover:bg-stone/70"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-lime">
                            {busy === "here" ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
                          </span>
                          <span className="text-[16px] font-medium text-forest">{busy === "here" ? t.home.locating : t.home.useLocation}</span>
                        </button>
                      )}
                      {q ? (
                        <>
                          <p className="px-3 pb-1 pt-2 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.home.results}</p>
                          {error && <p className="px-3 py-4 text-[15px] text-ink-soft">{t.home.searchError}</p>}
                          {results?.map((p) => row(p))}
                          {results?.length === 0 && !loading && (
                            <div className="mx-3 mt-2 rounded-2xl bg-stone/60 px-5 py-8 text-center">
                              <p className="font-medium text-ink">{t.home.noResults(q)}</p>
                              <p className="mt-1 text-[14px] text-ink-soft">{t.home.noResultsHint}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {mode === "to" && recentPlaces.length > 0 && (
                            <>
                              <p className="px-3 pb-1 pt-3 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.home.recent}</p>
                              {recentPlaces.map((p) => row(p))}
                            </>
                          )}
                          <p className="px-3 pb-1 pt-4 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.home.popular}</p>
                          {popular.map((p) => row(p))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
