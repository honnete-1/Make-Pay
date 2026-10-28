import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Minimal server-side proxy for the Google Routes API so the Routes key never
 * reaches the browser. Computes two-wheeler (moto) routes and returns the
 * shortest of Google's candidate routes. Returns 501 when not configured, so
 * the client falls back to the demo network.
 */
const KEY = process.env.GOOGLE_ROUTES_API_KEY ?? "";
const point = z.tuple([z.number().min(28).max(31.5), z.number().min(-3).max(-1)]); // [lng, lat] within Rwanda
const body = z.object({ origin: point, destination: point });

type GRoute = {
  distanceMeters?: number;
  duration?: string;
  description?: string;
  warnings?: string[];
  routeLabels?: string[];
  polyline?: { encodedPolyline?: string };
};

export async function POST(req: Request) {
  if (!KEY) return NextResponse.json({ error: "Routes API not configured" }, { status: 501 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  const { origin, destination } = parsed.data;
  const waypoint = ([lng, lat]: [number, number]) => ({ location: { latLng: { latitude: lat, longitude: lng } } });

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.description,routes.warnings,routes.routeLabels,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: waypoint(origin),
      destination: waypoint(destination),
      travelMode: "TWO_WHEELER",
      computeAlternativeRoutes: true,
      units: "METRIC",
      languageCode: "en",
      regionCode: "rw",
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return NextResponse.json({ error: "Routing provider unavailable" }, { status: 502 });
  const data = (await res.json()) as { routes?: GRoute[] };
  const routes = (data.routes ?? []).filter((r) => r.polyline?.encodedPolyline && r.distanceMeters);
  if (routes.length === 0) return NextResponse.json({ error: "No moto route found" }, { status: 404 });

  // All candidates are Google two-wheeler routes (Google applies its own access
  // restrictions). For a distance-based fare we prefer the shortest of them.
  const best = routes.reduce((a, b) => (b.distanceMeters! < a.distanceMeters! ? b : a));
  return NextResponse.json({
    encodedPolyline: best.polyline!.encodedPolyline,
    distanceKm: Math.round((best.distanceMeters! / 1000) * 10) / 10,
    durationMin: Math.max(1, Math.round(parseInt(best.duration ?? "0", 10) / 60)),
    via: best.description ? [best.description] : [],
    warnings: best.warnings ?? [],
    candidates: routes.length,
  });
}
