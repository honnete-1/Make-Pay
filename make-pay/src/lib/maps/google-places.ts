"use client";

import type { Place } from "@/types";
import { registerPlace } from "@/lib/places/registry";
import { KIGALI_BOUNDS } from "./config";
import { loadGoogleMaps, type GoogleNS } from "./google-loader";

/**
 * Places Autocomplete (New) through the Maps JavaScript API. Suggestions come
 * back as `pending` places; `resolveGooglePlace` fetches coordinates only once
 * the passenger picks one, which keeps each search to a single billed session.
 */
let token: GoogleNS = null;

export async function searchGooglePlaces(input: string): Promise<Place[]> {
  const g = await loadGoogleMaps();
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await g.maps.importLibrary("places");
  token ??= new AutocompleteSessionToken();
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken: token,
    includedRegionCodes: ["rw"],
    locationBias: KIGALI_BOUNDS,
    language: "en",
  });
  return (suggestions as GoogleNS[])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .slice(0, 6)
    .map(
      (p: GoogleNS): Place => ({
        id: `g:${p.placeId}`,
        googlePlaceId: p.placeId,
        name: p.mainText?.text ?? p.text?.text ?? "Place",
        area: p.secondaryText?.text ?? "Rwanda",
        coordinate: [0, 0],
        keywords: [],
        pending: true,
      }),
    );
}

export async function resolveGooglePlace(place: Place): Promise<Place> {
  if (!place.pending || !place.googlePlaceId) return place;
  const g = await loadGoogleMaps();
  const { Place: GPlace } = await g.maps.importLibrary("places");
  const gp = new GPlace({ id: place.googlePlaceId });
  await gp.fetchFields({ fields: ["location", "displayName", "formattedAddress"] });
  token = null; // a selection ends the autocomplete session
  if (!gp.location) throw new Error("Place has no location");
  return registerPlace({
    ...place,
    name: gp.displayName ?? place.name,
    area: gp.formattedAddress ?? place.area,
    coordinate: [gp.location.lng(), gp.location.lat()],
    pending: false,
  });
}
