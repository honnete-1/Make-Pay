import type { GpsSignal, RouteSummary, Trip, TripSummary } from "@/types";
import { quoteFare } from "./fare.mock";
import { DEMO_AVERAGE_SPEED_KMH } from "./fixtures/tariff";
import { hash } from "./latency";

/**
 * TRIP SIMULATOR
 * --------------
 * Advances a trip along its route with a deterministic speed profile. No real
 * GPS is read. Time is compressed so a city ride plays out in under a minute:
 * one real second equals `SIM_TIME_SCALE` simulated seconds.
 */
export const SIM_TIME_SCALE = 30;

export function createTrip(route: RouteSummary, now = new Date()): Trip {
  return {
    id: `trip_${route.id}_${now.getTime().toString(36)}`,
    route,
    extensions: [],
    path: route.path,
    plannedDistanceKm: route.distanceKm,
    totalDistanceKm: route.distanceKm,
    travelledKm: 0,
    elapsedSec: 0,
    status: "active",
    startedAt: now.toISOString(),
  };
}

/** Deterministic speed (km/h) at a simulated time — traffic ebbs and flows. */
export function speedAt(trip: Trip, simSec: number): number {
  const seed = (hash(trip.route.id) % 1000) / 1000;
  const wave = 0.22 * Math.sin(simSec / 55 + seed * 6) + 0.12 * Math.sin(simSec / 17 + seed * 11);
  // Short slow-down near junctions every ~4 simulated minutes.
  const junction = Math.sin(simSec / 38 + seed) > 0.93 ? -0.55 : 0;
  return Math.max(6, DEMO_AVERAGE_SPEED_KMH * (1 + wave + junction));
}

/** Advance a trip by `realDtSec` real seconds. Pure: returns a new trip. */
export function advanceTrip(trip: Trip, realDtSec: number, scale = SIM_TIME_SCALE): Trip {
  if (trip.status !== "active") return trip;
  const simDt = realDtSec * scale;
  const kmh = speedAt(trip, trip.elapsedSec);
  const travelledKm = Math.min(trip.totalDistanceKm, trip.travelledKm + (kmh / 3600) * simDt);
  const arrived = travelledKm >= trip.totalDistanceKm - 1e-6;
  return {
    ...trip,
    travelledKm,
    elapsedSec: trip.elapsedSec + simDt,
    status: arrived ? "arrived" : "active",
  };
}

/** Append a destination extension; the ride continues from the old destination. */
export function extendTrip(trip: Trip, extension: RouteSummary): Trip {
  return {
    ...trip,
    extensions: [...trip.extensions, extension],
    path: [...trip.path, ...extension.path.slice(1)],
    totalDistanceKm: Math.round((trip.totalDistanceKm + extension.distanceKm) * 10) / 10,
    status: "active",
  };
}

export function finalDestinationId(trip: Trip): string {
  return trip.extensions.at(-1)?.destinationId ?? trip.route.destinationId;
}

export function completeTrip(trip: Trip, now = new Date()): { trip: Trip; summary: TripSummary } {
  const travelledKm = Math.round(trip.travelledKm * 10) / 10;
  const ended: Trip = { ...trip, status: "completed", endedAt: now.toISOString() };
  return {
    trip: ended,
    summary: {
      tripId: trip.id,
      originId: trip.route.originId,
      destinationId: finalDestinationId(trip),
      plannedDistanceKm: trip.plannedDistanceKm,
      travelledKm,
      extraKm: Math.max(0, Math.round((travelledKm - trip.plannedDistanceKm) * 10) / 10),
      elapsedSec: Math.round(trip.elapsedSec),
      plannedQuote: quoteFare(trip.plannedDistanceKm),
      finalQuote: quoteFare(travelledKm),
      startedAt: trip.startedAt,
      endedAt: ended.endedAt!,
    },
  };
}

/** Mock GPS quality: deterministic by progress so the demo is repeatable. */
export function mockSignalAt(progress: number, online: boolean): GpsSignal {
  if (!online) return "offline";
  if (progress < 0.015) return "searching";
  if (progress > 0.42 && progress < 0.47) return "weak";
  return "strong";
}
