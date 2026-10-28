"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Clock, Crosshair, Loader2, Navigation, Search, X } from "lucide-react";
import { AppHeader, ActionBar, LoadingScreen } from "@/components/app/app-chrome";
import { PlacePickerDialog, PlaceRow, usePlaceSearch } from "@/components/trip/place-picker";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { services } from "@/lib/services";
import { SAMPLE_JOURNEYS } from "@/lib/mock-services/fixtures/kigali-graph";
import { greeting } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";

export default function AppHome() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { originId, destinationId, recentDestinations, trip, setOrigin, setDestination } = useTripStore();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [hello, setHello] = useState("Muraho");
  const { results, loading, error } = usePlaceSearch(query);
  const searchId = useId();

  useEffect(() => setHello(greeting()), []);

  const origin = services.routing.getPlace(originId);
  const destination = destinationId ? services.routing.getPlace(destinationId) : undefined;
  const searching = focused || query.length > 0;

  const locate = async () => {
    setLocating(true);
    const { place } = await services.location.getCurrentPlace();
    setOrigin(place.id);
    if (destinationId === place.id) setDestination(null);
    setLocating(false);
  };

  if (!hydrated) return <LoadingScreen label="Getting ready…" />;

  const activeTrip = trip && trip.status !== "completed";

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <div className="mx-auto w-full max-w-xl flex-1 px-5 pb-6">
          {activeTrip && (
            <Link href="/app/journey" className="mb-6 flex items-center gap-3 rounded-2xl bg-forest p-4 text-cream">
              <span className="relative grid size-10 place-items-center rounded-full bg-lime text-forest">
                <Navigation className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">Journey in progress</span>
                <span className="block text-[13px] text-cream/70">Tap to return to your ride</span>
              </span>
              <ArrowRight className="size-5 text-lime" />
            </Link>
          )}

          <p className="mt-2 text-[15px] text-ink-soft">{hello}</p>
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1] tracking-[-0.035em] text-forest md:text-5xl">Where are you going?</h1>

          {/* Route inputs */}
          <div className="mt-7 rounded-[1.75rem] bg-white p-2 shadow-float">
            <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
              <span aria-hidden className="size-3.5 shrink-0 rounded-full border-[3.5px] border-forest" />
              <button type="button" onClick={() => setOriginOpen(true)} className="min-w-0 flex-1 py-1.5 text-left" aria-label={`Starting point: ${origin?.name}. Change`}>
                <span className="block text-[12px] text-ink-soft">Starting from</span>
                <span className="block truncate text-[16px] font-medium text-ink">{origin?.name} · <span className="font-normal text-ink-soft">{origin?.area}</span></span>
              </button>
              <button type="button" onClick={locate} className="grid size-10 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label="Use current location">
                {locating ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
              </button>
            </div>
            <div aria-hidden className="mx-4 my-0.5 flex items-center gap-3">
              <span className="ml-[5px] h-4 w-px bg-stone-dark" />
              <span className="h-px flex-1 bg-stone" />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-stone/60 px-3 focus-within:bg-stone">
              <Search aria-hidden className="size-4 shrink-0 text-forest" />
              <label htmlFor={searchId} className="sr-only">Destination</label>
              <input
                id={searchId}
                value={query || (searching ? "" : destination?.name ?? "")}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search destination"
                autoComplete="off"
                className="h-14 min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-soft"
              />
              {loading && searching && <Loader2 className="size-4 animate-spin text-ink-soft" />}
              {(query || destination) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setDestination(null);
                  }}
                  className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-white"
                  aria-label="Clear destination"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {searching ? (
              <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <p className="px-3 pb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{query ? "Results" : "Places"}</p>
                {error && <p className="px-3 py-4 text-danger">{error}</p>}
                {results?.length === 0 && !loading && (
                  <div className="rounded-2xl bg-stone/60 px-5 py-8 text-center">
                    <p className="font-medium text-ink">No places match “{query}”.</p>
                    <p className="mt-1 text-[14px] text-ink-soft">Try Remera, Kimironko, Kacyiru or Airport.</p>
                  </div>
                )}
                <div className="space-y-0.5">
                  {results?.map((p) => (
                    <PlaceRow
                      key={p.id}
                      place={p}
                      selected={p.id === destinationId}
                      disabled={p.id === originId}
                      hint={p.id === originId ? "Your starting point" : undefined}
                      onSelect={(pl) => {
                        setDestination(pl.id);
                        setQuery("");
                        setFocused(false);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <section className="mt-8" aria-labelledby="recent-h">
                  <h2 id="recent-h" className="flex items-center gap-2 px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">
                    <Clock className="size-3.5" /> Recent destinations
                  </h2>
                  <div className="mt-2 space-y-0.5">
                    {recentDestinations
                      .map((id) => services.routing.getPlace(id))
                      .filter((p) => p && p.id !== originId)
                      .slice(0, 3)
                      .map((p) => (
                        <PlaceRow key={p!.id} place={p!} selected={p!.id === destinationId} onSelect={(pl) => setDestination(pl.id)} />
                      ))}
                  </div>
                </section>
                <section className="mt-8" aria-labelledby="sample-h">
                  <h2 id="sample-h" className="px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">Suggested journeys</h2>
                  <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
                    {SAMPLE_JOURNEYS.map((j) => (
                      <button
                        key={j.label}
                        type="button"
                        onClick={() => {
                          setOrigin(j.originId);
                          setDestination(j.destinationId);
                        }}
                        className="shrink-0 rounded-full border border-forest/15 bg-white px-4 py-2.5 text-[14px] font-medium text-forest transition-colors hover:border-forest/40"
                      >
                        {j.label}
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
      <ActionBar>
        <Button
          size="xl"
          block
          disabled={!destination}
          onClick={() => destination && router.push(`/app/route?from=${originId}&to=${destination.id}`)}
        >
          {destination ? <>Check fare to {destination.name} <ArrowRight /></> : "Choose a destination"}
        </Button>
      </ActionBar>

      <PlacePickerDialog
        open={originOpen}
        onOpenChange={setOriginOpen}
        title="Starting point"
        selectedId={originId}
        disabledId={destinationId}
        onSelect={(p) => setOrigin(p.id)}
      />
    </div>
  );
}
