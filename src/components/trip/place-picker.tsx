"use client";

import { useEffect, useId, useState } from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";
import type { Place } from "@/types";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

/** Debounced place search backed by the routing service. */
export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setLoading(true);
    const t = setTimeout(() => {
      services.routing
        .searchPlaces(query)
        .then((r) => live && (setResults(r), setError(null)))
        .catch(() => live && setError("Search is unavailable. Check your connection and try again."))
        .finally(() => live && setLoading(false));
    }, 160);
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
}: {
  place: Place;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (p: Place) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(place)}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors disabled:opacity-40",
        selected ? "bg-lime/60" : "hover:bg-stone/70 active:bg-stone",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", selected ? "bg-forest text-lime" : "bg-white text-forest shadow-[0_1px_0_rgb(18_61_53/0.06)]")}>
        {selected ? <Check className="size-4" /> : <MapPin className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-ink">{place.name}</span>
        <span className="block truncate text-[13px] text-ink-soft">{hint ?? place.area}</span>
      </span>
    </button>
  );
}

/** Full-height sheet for choosing a place (used for the starting point). */
export function PlacePickerDialog({
  open,
  onOpenChange,
  title,
  selectedId,
  disabledId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  selectedId?: string | null;
  disabledId?: string | null;
  onSelect: (p: Place) => void;
}) {
  const [q, setQ] = useState("");
  const { results, loading } = usePlaceSearch(q);
  const inputId = useId();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-[var(--radius-sheet)] bg-cream md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[80vh] md:w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-sheet)]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
              >
                <div className="flex items-center justify-between px-5 pb-2 pt-5">
                  <Dialog.Title className="font-display text-2xl font-semibold text-forest">{title}</Dialog.Title>
                  <Dialog.Close className="grid size-10 place-items-center rounded-full bg-stone text-forest" aria-label="Close">
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
                <div className="px-5 py-2">
                  <label htmlFor={inputId} className="sr-only">Search places</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest" />
                    <input id={inputId} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a neighbourhood" className="h-12 w-full rounded-2xl bg-white pl-11 pr-10 text-[16px] outline-none ring-forest/15 focus:ring-4" />
                    {loading && <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-soft" />}
                  </div>
                </div>
                <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-8">
                  {results?.map((p) => (
                    <PlaceRow
                      key={p.id}
                      place={p}
                      selected={p.id === selectedId}
                      disabled={p.id === disabledId}
                      hint={p.id === disabledId ? "Already your destination" : undefined}
                      onSelect={(pl) => {
                        onSelect(pl);
                        onOpenChange(false);
                      }}
                    />
                  ))}
                  {results?.length === 0 && <p className="px-4 py-8 text-center text-ink-soft">No demo places match “{q}”.</p>}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
