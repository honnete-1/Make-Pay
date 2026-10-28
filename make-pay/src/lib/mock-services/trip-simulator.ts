import type { GpsSignal, Leg, LngLat, RouteSummary, Trip, TripSummary } from "@/types";
import { pointAlong } from "@/lib/geo";
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
    legs: [{ kind: "planned", toId: route.destinationId, path: route.path, km: route.distanceKm }],
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

/** Legs of a trip; trips saved before legs existed are derived from route + extensions. */
export function tripLegs(trip: Trip): Leg[] {
  return (
    trip.legs ?? [
      { kind: "planned", toId: trip.route.destinationId, path: trip.route.path, km: trip.route.distanceKm },
      ...trip.extensions.map((e): Leg => ({ kind: "extension", toId: e.destinationId, path: e.path, km: e.distanceKm })),
    ]
  );
}

const sumKm = (legs: Leg[]) => Math.round(legs.reduce((s, l) => s + l.km, 0) * 1000) / 1000;
const joinPaths = (legs: Leg[]) => legs.flatMap((l, i) => (i === 0 ? l.path : l.path.slice(1)));

/**
 * Where the rider is: travelled km are walked leg by leg, so each leg's own
 * distance maps onto its own geometry. Adding a leg never moves the marker.
 */
export function tripPosition(trip: Trip): { point: LngLat; travelled: LngLat[]; legIndex: number; legStartKm: number } {
  const legs = tripLegs(trip);
  let acc = 0;
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]!;
    if (trip.travelledKm <= acc + leg.km + 1e-9 || i === legs.length - 1) {
      const f = leg.km > 0 ? Math.min(1, (trip.travelledKm - acc) / leg.km) : 1;
      const along = pointAlong(leg.path, f);
      return { point: along.point, travelled: [...joinPaths(legs.slice(0, i)), ...along.travelled], legIndex: i, legStartKm: acc };
    }
    acc += leg.km;
  }
  const last = trip.path.at(-1) ?? [0, 0];
  return { point: last, travelled: trip.path, legIndex: 0, legStartKm: 0 };
}

/** Advance a trip by `realDtSec` real seconds. Pure: returns a new trip. */
export function advanceTrip(trip: Trip, realDtSec: number, scale = SIM_TIME_SCALE): Trip {
  if (trip.status !== "active") return trip;
  const simDt = realDtSec * scale;
  const atEnd = trip.travelledKm >= trip.totalDistanceKm - 1e-6;
  // "Keep riding" with no destination: the simulator has no road to follow, so
  // time passes but no distance is invented. Real GPS would keep counting.
  if (atEnd && trip.continuing) return { ...trip, elapsedSec: trip.elapsedSec + simDt };
  const kmh = speedAt(trip, trip.elapsedSec);
  const travelledKm = Math.min(trip.totalDistanceKm, trip.travelledKm + (kmh / 3600) * simDt);
  const arrived = travelledKm >= trip.totalDistanceKm - 1e-6;
  return {
    ...trip,
    travelledKm,
    elapsedSec: trip.elapsedSec + simDt,
    status: arrived && !trip.continuing ? "arrived" : "active",
  };
}

/** Passenger chose to continue past the destination without naming a new one. */
export function continueTrip(trip: Trip): Trip {
  return { ...trip, continuing: true, status: "active" };
}

/**
 * Send the ride somewhere new from where the rider is now. Everything already
 * travelled is frozen into a "travelled" leg (same km, same geometry); the
 * unridden rest of the old plan is dropped and the new route appended. Only
 * new distance is added — nothing is reset or counted twice.
 */
export function redirectTrip(trip: Trip, route: RouteSummary): Trip {
  const legs = tripLegs(trip);
  const pos = tripPosition(trip);
  const current = legs[pos.legIndex]!;
  const doneKm = trip.travelledKm - pos.legStartKm;
  const kept: Leg[] = legs.slice(0, pos.legIndex);
  if (doneKm >= current.km - 1e-6) kept.push(current);
  else if (doneKm > 0.001) kept.push({ kind: "travelled", toId: current.toId, path: pointAlong(current.path, doneKm / current.km).travelled, km: doneKm });
  const atEnd = trip.travelledKm >= trip.totalDistanceKm - 1e-6;
  const next: Leg = { kind: atEnd ? "extension" : "redirect", toId: route.destinationId, path: route.path, km: route.distanceKm };
  const newLegs = [...kept, next];
  return {
    ...trip,
    legs: newLegs,
    extensions: [...trip.extensions, route],
    path: joinPaths(newLegs),
    totalDistanceKm: sumKm(newLegs),
    status: "active",
    continuing: false,
  };
}

/** Append a destination extension from the current destination (kept for compatibility). */
export function extendTrip(trip: Trip, extension: RouteSummary): Trip {
  const legs: Leg[] = [...tripLegs(trip), { kind: "extension", toId: extension.destinationId, path: extension.path, km: extension.distanceKm }];
  return {
    ...trip,
    legs,
    extensions: [...trip.extensions, extension],
    path: joinPaths(legs),
    totalDistanceKm: sumKm(legs),
    status: "active",
    continuing: false,
  };
}

export function finalDestinationId(trip: Trip): string {
  return tripLegs(trip).at(-1)?.toId ?? trip.route.destinationId;
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
