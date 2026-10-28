"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker as MLMarker, GeoJSONSource } from "maplibre-gl";
import { Layers, Map as MapIcon } from "lucide-react";
import type { LngLat } from "@/types";
import { bounds } from "@/lib/geo";
import { SchematicMap } from "./schematic-map";
import { useOnline } from "@/hooks/use-online";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
const LOAD_TIMEOUT_MS = 9000;
const WORKER_URL = "/maplibre-gl-worker.mjs";

export interface RouteMapProps {
  path: LngLat[];
  travelled?: LngLat[];
  position?: LngLat;
  origin?: { id: string; coordinate: LngLat };
  destination?: { id: string; coordinate: LngLat };
  /** Extra padding (px) so the route is not hidden under the sheet. */
  padding?: { top: number; bottom: number; left: number; right: number };
  follow?: boolean;
  className?: string;
}

type Mode = "loading" | "map" | "schematic";

function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const line = (coords: LngLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: coords.length > 1 ? coords : [] },
});

/**
 * Interactive MapLibre map with an honest fallback: if WebGL is missing, the
 * device is offline, or tiles fail to load, it renders the schematic SVG map
 * of the same route instead of a broken grey box.
 */
export function RouteMap({ path, travelled, position, origin, destination, padding, follow, className }: RouteMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef<{ rider?: MLMarker }>({});
  const [mode, setMode] = useState<Mode>("loading");
  const [ready, setReady] = useState(false);
  const [userChoice, setUserChoice] = useState<"map" | "schematic" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const online = useOnline();
  const t = useT();
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const node = wrap.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => e && setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  const inset =
    padding && size.w > 0 && size.h > 0
      ? { top: padding.top / size.h, bottom: Math.min(0.7, padding.bottom / size.h), left: Math.min(0.6, padding.left / size.w), right: padding.right / size.w }
      : undefined;

  const wantSchematic = userChoice === "schematic" || (!online && userChoice !== "map");

  // Create the map once.
  useEffect(() => {
    if (wantSchematic) return;
    if (!webglSupported()) {
      setMode("schematic");
      return;
    }
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      // Worker is served from /public (see scripts/copy-map-worker.mjs).
      if (ml.getWorkerUrl() !== WORKER_URL) ml.setWorkerUrl(WORKER_URL);
      const m = new ml.Map({
        container: el.current,
        style: STYLE_URL,
        bounds: path.length > 1 ? (bounds(path) as [LngLat, LngLat]) : undefined,
        center: path[0] ?? [30.0619, -1.9441],
        zoom: 12.5,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        fadeDuration: 0,
      });
      map.current = m;
      m.touchZoomRotate.disableRotation();
      const fallBack = () => {
        if (cancelled) return;
        setMode("schematic");
        m.remove();
        map.current = null;
      };
      timeout = setTimeout(() => !m.loaded() && fallBack(), LOAD_TIMEOUT_MS);
      m.on("error", (e) => {
        // Style failure before first load → fall back rather than show a broken map.
        console.warn("[Mâke pay map]", e.error?.message);
        if (!m.isStyleLoaded() && !m.loaded()) fallBack();
      });
      m.on("load", () => {
        if (cancelled) return;
        clearTimeout(timeout);
        m.addSource("route", { type: "geojson", data: line(path) });
        m.addSource("travelled", { type: "geojson", data: line(travelled ?? []) });
        m.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#173C32", "line-width": 11, "line-opacity": 0.18 } });
        m.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#173C32", "line-width": 5 } });
        m.addLayer({ id: "travelled-glow", type: "line", source: "travelled", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#C7E874", "line-width": 12, "line-opacity": 0.55 } });
        m.addLayer({ id: "travelled-line", type: "line", source: "travelled", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#173C32", "line-width": 5 } });
        if (origin) new ml.Marker({ element: pinEl("origin") }).setLngLat(origin.coordinate).addTo(m);
        if (destination) new ml.Marker({ element: pinEl("destination") }).setLngLat(destination.coordinate).addTo(m);
        markers.current.rider = new ml.Marker({ element: riderEl() }).setLngLat(position ?? path[0] ?? [0, 0]);
        if (position) markers.current.rider.addTo(m);
        setMode("map");
        setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      map.current?.remove();
      map.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once per attempt; updates below
  }, [wantSchematic, attempt]);

  // Route geometry updates (e.g. destination extension).
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (m.getSource("route") as GeoJSONSource | undefined)?.setData(line(path));
    if (path.length > 1) {
      m.resize();
      m.fitBounds(bounds(path) as [LngLat, LngLat], { padding: safePadding(m, padding), duration: 800, maxZoom: 15 });
    }
  }, [ready, path, padding]);

  // Progress updates.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (m.getSource("travelled") as GeoJSONSource | undefined)?.setData(line(travelled ?? []));
    if (position && markers.current.rider) {
      markers.current.rider.setLngLat(position);
      if (!markers.current.rider.getElement().isConnected) markers.current.rider.addTo(m);
      if (follow) m.easeTo({ center: position, duration: 400 });
    }
  }, [ready, travelled, position, follow]);

  const showSchematic = wantSchematic || mode === "schematic";

  return (
    <div ref={wrap} className={cn("relative h-full w-full overflow-hidden bg-stone", className)}>
      {showSchematic ? (
        <SchematicMap
          path={path}
          travelled={travelled}
          position={position}
          originId={origin?.id}
          destinationId={destination?.id}
          fitToPath
          animateDraw={!travelled}
          inset={inset}
        />
      ) : (
        <div className="absolute inset-0">
          {/* MapLibre sets position:relative on its container, so it fills a positioned wrapper. */}
          <div ref={el} className="h-full w-full" aria-label={t.map.region} role="region" />
        </div>
      )}
      {mode === "loading" && !showSchematic && (
        <div className="absolute inset-0 grid place-items-center bg-stone">
          <div className="flex flex-col items-center gap-3 text-sm text-ink-soft">
            <span className="size-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
            {t.map.loading}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (showSchematic) {
            setUserChoice("map");
            setMode("loading");
            setAttempt((a) => a + 1);
          } else setUserChoice("schematic");
        }}
        className="absolute right-4 top-[76px] z-10 flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[12px] font-medium text-forest shadow-float backdrop-blur"
        aria-label={showSchematic ? t.map.interactive : t.map.lite}
      >
        {showSchematic ? <MapIcon className="size-3.5" /> : <Layers className="size-3.5" />}
        {showSchematic ? t.map.interactive : t.map.lite}
      </button>
      {showSchematic && mode === "schematic" && userChoice !== "schematic" && (
        <p className="absolute right-4 top-[120px] z-10 max-w-[70%] rounded-full bg-white/95 px-3 py-1.5 text-[11px] text-ink-soft shadow-float">
          {online ? t.map.tilesDown : t.map.offline}
        </p>
      )}
    </div>
  );
}

/** Clamp padding so it always leaves room for the route on small screens. */
function safePadding(m: MLMap, p?: RouteMapProps["padding"]) {
  const base = p ?? { top: 60, bottom: 60, left: 60, right: 60 };
  const c = m.getContainer();
  const h = c.clientHeight || 1;
  const w = c.clientWidth || 1;
  const vy = Math.min(1, (h * 0.8) / (base.top + base.bottom));
  const vx = Math.min(1, (w * 0.8) / (base.left + base.right));
  return { top: base.top * vy, bottom: base.bottom * vy, left: base.left * vx, right: base.right * vx };
}

/** Lettered A/B pins: easier to read than abstract dots for people new to maps. */
export function pinEl(kind: "origin" | "destination") {
  const d = document.createElement("div");
  const origin = kind === "origin";
  d.style.cssText = `width:34px;height:34px;border-radius:999px;display:grid;place-items:center;font:700 15px/1 system-ui,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.3);border:3px solid ${origin ? "#fff" : "#173C32"};background:${origin ? "#173C32" : "#C7E874"};color:${origin ? "#fff" : "#173C32"}`;
  d.textContent = origin ? "A" : "B";
  d.setAttribute("aria-label", origin ? "A" : "B");
  return d;
}

export function riderEl() {
  const d = document.createElement("div");
  d.setAttribute("aria-label", "Simulated rider position");
  d.style.width = "22px";
  d.style.height = "22px";
  d.innerHTML = `<span style="position:absolute;left:-14px;top:-14px;width:50px;height:50px;border-radius:999px;background:#C7E874;opacity:.45" class="animate-pulse-ring"></span><span style="position:absolute;inset:0;border-radius:999px;background:#173C32;border:4px solid #C7E874;box-shadow:0 2px 10px rgba(0,0,0,.3)"></span>`;
  return d;
}
