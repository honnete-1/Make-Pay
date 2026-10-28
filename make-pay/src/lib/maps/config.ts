/**
 * Google Maps Platform configuration.
 *
 * - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: browser key for Maps JavaScript API and
 *   Places API (New). Restrict it to your domains (HTTP referrers) and to
 *   those two APIs in Google Cloud Console.
 * - GOOGLE_ROUTES_API_KEY: server-only key for the Routes API, used by
 *   /api/routes. Never prefix it with NEXT_PUBLIC_.
 *
 * Without the browser key the app runs in demo mode (MapLibre + demo routes).
 */
export const GOOGLE_BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
export const GOOGLE_ENABLED = GOOGLE_BROWSER_KEY.length > 0;

/** Kigali bounding box used to bias and restrict place search. */
export const KIGALI_BOUNDS = { south: -2.08, west: 29.97, north: -1.85, east: 30.25 };
export const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };
