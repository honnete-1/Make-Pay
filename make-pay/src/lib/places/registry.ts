import type { Place, PlaceId } from "@/types";
import { PLACES } from "@/lib/mock-services/fixtures/kigali-graph";

/**
 * Every place the app can name: the built-in Kigali list plus places the
 * passenger picked from Google search. Screens look places up by id here, so
 * a Google result behaves exactly like a built-in landmark.
 */
const extra = new Map<PlaceId, Place>();

export function registerPlace(place: Place): Place {
  if (!place.pending && !PLACES.some((p) => p.id === place.id)) extra.set(place.id, place);
  return place;
}

export function lookupPlace(id: PlaceId | null | undefined): Place | undefined {
  if (!id) return undefined;
  return PLACES.find((p) => p.id === id) ?? extra.get(id);
}

export function isDemoPlace(id: PlaceId): boolean {
  return PLACES.some((p) => p.id === id);
}
