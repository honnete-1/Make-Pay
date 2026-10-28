import type { LngLat, Place, RouteSummary } from "@/types";
import type { RoutingService } from "@/lib/services/contracts";
import { computeRoute, computeRouteFromPoint, mockRoutingService } from "@/lib/mock-services/routing.mock";
import { isDemoPlace, lookupPlace } from "@/lib/places/registry";
import { GOOGLE_ENABLED } from "./config";
import { decodePolyline } from "./polyline";
import { resolveGooglePlace, searchGooglePlaces } from "./google-places";

/**
 * Routing provider used by the app. With a Google key it searches with Places
 * Autocomplete and routes through /api/routes (Google Routes, TWO_WHEELER).
 * Whenever Google is unavailable it falls back to the demo network — and marks
 * the route `source: "demo"` so it is never presented as a Google result.
 */
async function googleRoute(from: LngLat, to: LngLat): Promise<Omit<RouteSummary, "id" | "originId" | "destinationId">> {
  const res = await fetch("/api/routes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ origin: from, destination: to }),
  });
  if (!res.ok) throw new Error(`routes ${res.status}`);
  const j = (await res.json()) as { encodedPolyline: string; distanceKm: number; durationMin: number; via: string[]; warnings: string[] };
  return { path: decodePolyline(j.encodedPolyline), distanceKm: j.distanceKm, durationMin: j.durationMin, via: j.via, warnings: j.warnings, source: "google" };
}

const SAME_PLACE = "same-place";

export const routingProvider: RoutingService = {
  ...mockRoutingService,

  async searchPlaces(query) {
    const local = await mockRoutingService.searchPlaces(query);
    if (!GOOGLE_ENABLED || query.trim().length < 2) return local;
    try {
      const remote = await searchGooglePlaces(query.trim());
      return [...local.slice(0, 3), ...remote];
    } catch {
      return local; // Places unavailable: built-in landmarks still work
    }
  },

  async resolvePlace(place: Place) {
    return place.pending ? resolveGooglePlace(place) : place;
  },

  async getRoute(originId, destinationId) {
    if (originId === destinationId) throw new Error(SAME_PLACE);
    const o = lookupPlace(originId);
    const d = lookupPlace(destinationId);
    if (!o || !d) throw new Error("unknown-place");
    if (GOOGLE_ENABLED) {
      try {
        return { id: `${originId}__${destinationId}`, originId, destinationId, ...(await googleRoute(o.coordinate, d.coordinate)) };
      } catch {
        if (!isDemoPlace(originId) || !isDemoPlace(destinationId)) throw new Error("route-unavailable");
        return { ...computeRoute(originId, destinationId), fellBack: true };
      }
    }
    return mockRoutingService.getRoute(originId, destinationId);
  },

  async getRouteFromPoint(from, destinationId) {
    const d = lookupPlace(destinationId);
    if (!d) throw new Error("unknown-place");
    if (GOOGLE_ENABLED) {
      try {
        return { id: `here__${destinationId}`, originId: "here", destinationId, ...(await googleRoute(from, d.coordinate)) };
      } catch {
        if (!isDemoPlace(destinationId)) throw new Error("route-unavailable");
        return { ...computeRouteFromPoint(from, destinationId), fellBack: true };
      }
    }
    return mockRoutingService.getRouteFromPoint(from, destinationId);
  },
};
