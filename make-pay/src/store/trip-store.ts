"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Place, Receipt, RouteSummary, Trip, TripSummary } from "@/types";
import { advanceTrip, completeTrip, continueTrip, createTrip, extendTrip, redirectTrip } from "@/lib/mock-services/trip-simulator";
import { isDemoPlace, registerPlace } from "@/lib/places/registry";
import { SEED_HISTORY } from "@/lib/mock-services/receipt.mock";

interface TripState {
  originId: string;
  destinationId: string | null;
  recentDestinations: string[];
  route: RouteSummary | null;
  trip: Trip | null;
  summary: TripSummary | null;
  receipts: Receipt[];
  /** Non-built-in places (Google results, device location), kept so trips and receipts can name them after a refresh. */
  savedPlaces: Place[];
  /** Demo speed multiplier on top of the simulator's time compression. */
  demoSpeed: 1 | 2;

  setOrigin: (id: string) => void;
  setDestination: (id: string | null) => void;
  setRoute: (route: RouteSummary | null) => void;
  startTrip: () => void;
  tick: (realDtSec: number) => void;
  extend: (extension: RouteSummary) => void;
  /** Change destination from the rider's current position (mid-ride or after arriving). */
  redirect: (route: RouteSummary) => void;
  /** Keep the trip running past the destination without choosing a new one. */
  keepRiding: () => void;
  savePlace: (place: Place) => void;
  endTrip: () => void;
  addReceipt: (receipt: Receipt) => void;
  setDemoSpeed: (s: 1 | 2) => void;
  resetJourney: () => void;
  clearHistory: () => void;
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
      savedPlaces: [],
      demoSpeed: 1,

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
        set({ trip: createTrip(route), summary: null });
      },
      tick: (dt) => {
        const { trip, demoSpeed } = get();
        if (!trip || trip.status !== "active") return;
        set({ trip: advanceTrip(trip, dt * demoSpeed) });
      },
      extend: (extension) => {
        const { trip } = get();
        if (!trip) return;
        set({ trip: extendTrip(trip, extension) });
      },
      redirect: (route) => {
        const { trip } = get();
        if (!trip || trip.status === "completed") return;
        set({ trip: redirectTrip(trip, route) });
      },
      keepRiding: () => {
        const { trip } = get();
        if (!trip || trip.status === "completed") return;
        set({ trip: continueTrip(trip) });
      },
      savePlace: (place) => {
        if (place.pending || isDemoPlace(place.id)) return;
        registerPlace(place);
        set((s) => ({ savedPlaces: [place, ...s.savedPlaces.filter((p) => p.id !== place.id)].slice(0, 30) }));
      },
      endTrip: () => {
        const { trip } = get();
        if (!trip) return;
        const { trip: ended, summary } = completeTrip(trip);
        set({ trip: ended, summary });
      },
      addReceipt: (receipt) =>
        set((s) => ({ receipts: [receipt, ...s.receipts.filter((r) => r.id !== receipt.id)] })),
      setDemoSpeed: (demoSpeed) => set({ demoSpeed }),
      resetJourney: () => set({ destinationId: null, route: null, trip: null, summary: null }),
      clearHistory: () => set({ receipts: [] }),
    }),
    {
      name: "make-pay-demo-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        originId: s.originId,
        destinationId: s.destinationId,
        recentDestinations: s.recentDestinations,
        route: s.route,
        trip: s.trip,
        summary: s.summary,
        receipts: s.receipts,
        savedPlaces: s.savedPlaces,
        demoSpeed: s.demoSpeed,
      }),
      onRehydrateStorage: () => (state) => state?.savedPlaces?.forEach(registerPlace),
    },
  ),
);
