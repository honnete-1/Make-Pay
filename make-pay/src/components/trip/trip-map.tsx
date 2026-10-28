"use client";

import { useEffect, useRef, useState } from "react";
import type { LngLat } from "@/types";
import { GOOGLE_ENABLED, GOOGLE_MAP_ID, KIGALI_CENTER } from "@/lib/maps/config";
import { loadGoogleMaps, type GoogleNS } from "@/lib/maps/google-loader";
import { useT } from "@/i18n";
import { pinEl, riderEl, RouteMap, type RouteMapProps } from "./route-map";

/**
 * The map used on every trip screen. With a Google key it renders Google Maps
 * (streets, neighbourhoods and landmarks around the route); if Google is not
 * configured or fails to load, it falls back to the existing MapLibre map,
 * which itself falls back to the schematic view. The trip UI never breaks.
 */
export function TripMap(props: RouteMapProps) {
  const [googleFailed, setGoogleFailed] = useState(false);
  const t = useT();
  if (!GOOGLE_ENABLED || googleFailed) {
    return (
      <div className="relative h-full w-full">
        <RouteMap {...props} />
        {googleFailed && (
          <p role="status" className="absolute left-4 top-[76px] z-10 max-w-[55%] rounded-2xl bg-white/95 px-3 py-1.5 text-[11px] text-ink-soft shadow-float">
            {t.map.googleDown}
          </p>
        )}
      </div>
    );
  }
  return <GoogleRouteMap {...props} onFail={() => setGoogleFailed(true)} />;
}

const toLL = (p: LngLat[]) => p.map(([lng, lat]) => ({ lat, lng }));

function GoogleRouteMap({ path, travelled, position, origin, destination, padding, follow, onFail }: RouteMapProps & { onFail: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const t = useT();
  const g = useRef<{
    map: GoogleNS;
    route: GoogleNS[];
    travelled: GoogleNS[];
    rider: GoogleNS;
    a: GoogleNS;
    b: GoogleNS;
    LatLngBounds: GoogleNS;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const google = await loadGoogleMaps();
        const [{ Map, Polyline, LatLngBounds }, { AdvancedMarkerElement }] = await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
        ]);
        if (cancelled || !el.current) return;
        const map = new Map(el.current, {
          mapId: GOOGLE_MAP_ID,
          center: KIGALI_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        const line = (color: string, weight: number, opacity: number, z: number) =>
          new Polyline({ map, strokeColor: color, strokeWeight: weight, strokeOpacity: opacity, zIndex: z, clickable: false });
        g.current = {
          map,
          LatLngBounds,
          route: [line("#173C32", 13, 0.2, 1), line("#173C32", 6, 1, 2)],
          travelled: [line("#C7E874", 13, 0.85, 3), line("#173C32", 6, 1, 4)],
          a: new AdvancedMarkerElement({ map, content: pinEl("origin"), title: t.map.start, zIndex: 10 }),
          b: new AdvancedMarkerElement({ map, content: pinEl("destination"), title: t.map.end, zIndex: 11 }),
          rider: new AdvancedMarkerElement({ content: riderEl(), title: t.map.you, zIndex: 12 }),
        };
        setReady(true);
      } catch {
        if (!cancelled) onFail();
      }
    })();
    return () => {
      cancelled = true;
      const m = g.current;
      if (m) [...m.route, ...m.travelled].forEach((l) => l.setMap(null));
      g.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created once
  }, []);

  // Route, markers and framing.
  useEffect(() => {
    const m = g.current;
    if (!ready || !m) return;
    m.route.forEach((l) => l.setPath(toLL(path)));
    if (origin) m.a.position = { lat: origin.coordinate[1], lng: origin.coordinate[0] };
    if (destination) m.b.position = { lat: destination.coordinate[1], lng: destination.coordinate[0] };
    if (path.length > 1) {
      const b = new m.LatLngBounds();
      toLL(path).forEach((p) => b.extend(p));
      m.map.fitBounds(b, padding ?? 60);
    }
  }, [ready, path, origin, destination, padding]);

  // Live progress.
  useEffect(() => {
    const m = g.current;
    if (!ready || !m) return;
    m.travelled.forEach((l) => l.setPath(toLL(travelled ?? [])));
    if (position) {
      m.rider.position = { lat: position[1], lng: position[0] };
      if (!m.rider.map) m.rider.map = m.map;
      if (follow) m.map.panTo({ lat: position[1], lng: position[0] });
    }
  }, [ready, travelled, position, follow]);

  return (
    <div className="relative h-full w-full bg-stone">
      <div ref={el} className="h-full w-full" role="region" aria-label={t.map.region} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-stone">
          <div className="flex flex-col items-center gap-3 text-sm text-ink-soft">
            <span className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
            {t.map.loading}
          </div>
        </div>
      )}
    </div>
  );
}
