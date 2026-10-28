"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Receipt, RouteSummary, Trip, TripSummary } from "@/types";
import { advanceTrip, completeTrip, createTrip, extendTrip } from "@/lib/mock-services/trip-simulator";
import { SEED_HISTORY } from "@/lib/mock-services/receipt.mock";
import { deleteReceipts, fetchReceipts, patchTrip, postReceipt, postTrip } from "@/lib/services";

interface TripState {
  originId: string;
  destinationId: string | null;
  recentDestinations: string[];
  route: RouteSummary | null;
  trip: Trip | null;
  summary: TripSummary | null;
  receipts: Receipt[];
  /** Speed multiplier on top of the simulator's time compression. */
  demoSpeed: 1 | 2;
  receiptsHydrated: boolean;

  setOrigin: (id: string) => void;
  setDestination: (id: string | null) => void;
  setRoute: (route: RouteSummary | null) => void;
  startTrip: () => void;
  tick: (realDtSec: number) => void;
  extend: (extension: RouteSummary) => void;
  endTrip: () => void;
  addReceipt: (receipt: Receipt) => void;
  setDemoSpeed: (s: 1 | 2) => void;
  resetJourney: () => void;
  clearHistory: () => void;
  hydrateReceipts: () => Promise<void>;
}

function syncTrip(trip: Trip, summary?: TripSummary) {
  void patchTrip(trip.id, { action: "sync", trip, summary }).catch(() => {
    /* offline / first paint — local state remains source of truth for the ride */
  });
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      originId: "cbd",
      destinationId: null,
      recentDestinations: ["remera", "kimironko", "kcc"],
      route: null,
      trip: null,
      summary: null,
      receipts: SEED_HISTORY,
      demoSpeed: 1,
      receiptsHydrated: false,

      setOrigin: (originId) => set({ originId, route: null }),
      setDestination: (destinationId) =>
        set((s) => ({
          destinationId,
          route: null,
          recentDestinations: destinationId
            ? [destinationId, ...s.recentDestinations.filter((d) => d !== destinationId)].slice(0, 4)
            : s.recentDestinations,
        })),
      setRoute: (route) => set({ route }),
      startTrip: () => {
        const { route } = get();
        if (!route) return;
        const trip = createTrip(route);
        set({ trip, summary: null });
        void postTrip(trip).catch(() => {
          /* local trip still drives the ride */
        });
      },
      tick: (dt) => {
        const { trip, demoSpeed } = get();
        if (!trip || trip.status !== "active") return;
        set({ trip: advanceTrip(trip, dt * demoSpeed) });
      },
      extend: (extension) => {
        const { trip } = get();
        if (!trip) return;
        const next = extendTrip(trip, extension);
        set({ trip: next });
        void patchTrip(next.id, { action: "extend", extension }).catch(() => syncTrip(next));
      },
      endTrip: () => {
        const { trip } = get();
        if (!trip) return;
        const { trip: ended, summary } = completeTrip(trip);
        set({ trip: ended, summary });
        void patchTrip(ended.id, { action: "complete", trip: ended }).catch(() => syncTrip(ended, summary));
      },
      addReceipt: (receipt) => {
        set((s) => ({ receipts: [receipt, ...s.receipts.filter((r) => r.id !== receipt.id)] }));
        void postReceipt(receipt).catch(() => {
          /* kept locally */
        });
      },
      setDemoSpeed: (demoSpeed) => set({ demoSpeed }),
      resetJourney: () => set({ destinationId: null, route: null, trip: null, summary: null }),
      clearHistory: () => {
        set({ receipts: [] });
        void deleteReceipts().catch(() => {
          /* kept local clear */
        });
      },
      hydrateReceipts: async () => {
        try {
          const receipts = await fetchReceipts();
          set({ receipts, receiptsHydrated: true });
        } catch {
          set({ receiptsHydrated: true });
        }
      },
    }),
    {
      name: "make-pay-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        originId: s.originId,
        destinationId: s.destinationId,
        recentDestinations: s.recentDestinations,
        route: s.route,
        trip: s.trip,
        summary: s.summary,
        receipts: s.receipts,
        demoSpeed: s.demoSpeed,
      }),
    },
  ),
);
