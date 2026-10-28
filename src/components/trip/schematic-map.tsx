"use client";

import { motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { LngLat } from "@/types";
import { EDGES, NODES, PLACES } from "@/lib/mock-services/fixtures/kigali-graph";
import { cn } from "@/lib/utils";

/**
 * SCHEMATIC MAP — a lightweight SVG rendering of the demo road graph.
 * Used on the landing page (fast, no tiles) and as the offline / no-WebGL
 * fallback for the interactive MapLibre map in the app.
 */

const ALL = Object.values(NODES).map((n) => n.coordinate);

export interface SchematicMapProps {
  path?: LngLat[];
  travelled?: LngLat[];
  position?: LngLat;
  originId?: string;
  destinationId?: string;
  /** Fit the viewport to the path instead of the whole city. */
  fitToPath?: boolean;
  tone?: "light" | "dark";
  showLabels?: boolean;
  animateDraw?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Fractions of the view kept clear (e.g. under a bottom sheet) when fitting the path. */
  inset?: { top: number; right: number; bottom: number; left: number };
}

export function SchematicMap({
  path = [],
  travelled,
  position,
  originId,
  destinationId,
  fitToPath = false,
  tone = "light",
  showLabels = true,
  animateDraw = true,
  className,
  ariaLabel = "Map of the route",
  inset,
}: SchematicMapProps) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [aspect, setAspect] = useState(0.7);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const r = e?.contentRect;
      if (r && r.width > 0 && r.height > 0) setAspect(Math.min(2.4, Math.max(0.35, r.height / r.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = 1000;
  const H = Math.round(1000 * aspect);
  const ins = inset ?? { top: 0, right: 0, bottom: 0, left: 0 };

  // Visible sub-rectangle of the view (excluding overlays such as sheets).
  const box = { x: W * ins.left, y: H * ins.top, w: W * (1 - ins.left - ins.right), h: H * (1 - ins.top - ins.bottom) };

  const ext = useMemo(() => {
    const src = fitToPath && path.length > 1 ? path : ALL;
    const xs = src.map((c) => c[0]);
    const ys = src.map((c) => c[1]);
    let minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const padX = (maxX - minX) * (fitToPath ? 0.18 : 0.04) + 0.003;
    const padY = (maxY - minY) * (fitToPath ? 0.18 : 0.04) + 0.003;
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [fitToPath, path]);

  const project = (c: LngLat): [number, number] => {
    const sx = box.w / (ext.maxX - ext.minX);
    const sy = box.h / (ext.maxY - ext.minY);
    const s = Math.min(sx, sy);
    const ox = box.x + (box.w - (ext.maxX - ext.minX) * s) / 2;
    const oy = box.y + (box.h - (ext.maxY - ext.minY) * s) / 2;
    return [ox + (c[0] - ext.minX) * s, oy + (ext.maxY - c[1]) * s];
  };
  const toD = (pts: LngLat[]) => pts.map((p, i) => `${i ? "L" : "M"}${project(p).map((v) => v.toFixed(1)).join(" ")}`).join(" ");

  const dark = tone === "dark";
  const c = {
    bg: dark ? "#0F332C" : "#EFEDE6",
    road: dark ? "rgba(248,246,240,0.14)" : "rgba(18,61,53,0.16)",
    contour: dark ? "rgba(248,246,240,0.05)" : "rgba(18,61,53,0.06)",
    label: dark ? "rgba(248,246,240,0.55)" : "rgba(29,37,37,0.55)",
    route: dark ? "#D9F068" : "#123D35",
    travelled: "#D9F068",
    casing: dark ? "rgba(217,240,104,0.18)" : "rgba(18,61,53,0.14)",
  };

  const origin = PLACES.find((p) => p.id === originId);
  const destination = PLACES.find((p) => p.id === destinationId);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className={cn("h-full w-full", className)} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={c.bg} />
      {/* topographic hint — Kigali is a city of hills */}
      <g fill="none" stroke={c.contour} strokeWidth={1.2}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx={W * (0.2 + (i % 3) * 0.32)} cy={H * (0.25 + Math.floor(i / 3) * 0.28)} rx={60 + (i % 4) * 40} ry={36 + (i % 3) * 24} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={`b${i}`} cx={W * (0.2 + (i % 3) * 0.32)} cy={H * (0.25 + Math.floor(i / 3) * 0.28)} rx={110 + (i % 4) * 50} ry={66 + (i % 3) * 30} />
        ))}
      </g>
      <g stroke={c.road} strokeWidth={5} strokeLinecap="round" fill="none">
        {EDGES.map(([a, b]) => {
          const p1 = project(NODES[a]!.coordinate);
          const p2 = project(NODES[b]!.coordinate);
          return <line key={`${a}-${b}`} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />;
        })}
      </g>
      {showLabels &&
        PLACES.map((p) => {
          const [x, y] = project(p.coordinate);
          if (x < 0 || x > W || y < 0 || y > H) return null;
          const isEnd = p.id === originId || p.id === destinationId;
          return (
            <g key={p.id}>
              <circle cx={x} cy={y} r={4} fill={c.label} opacity={isEnd ? 0 : 0.7} />
              <text x={x + 10} y={y - 10} fontSize={isEnd ? 24 : 19} fontWeight={isEnd ? 600 : 500} fill={isEnd ? (dark ? "#F8F6F0" : "#123D35") : c.label} style={{ fontFamily: "var(--font-sans)" }}>
                {p.name}
              </text>
            </g>
          );
        })}
      {path.length > 1 && (
        <>
          <path d={toD(path)} fill="none" stroke={c.casing} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          <motion.path
            key={`${uid}-${path.length}-${path[0]?.join()}-${path.at(-1)?.join()}`}
            d={toD(path)}
            fill="none"
            stroke={c.route}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={travelled ? "2 14" : undefined}
            initial={animateDraw ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </>
      )}
      {travelled && travelled.length > 1 && (
        <path d={toD(travelled)} fill="none" stroke={dark ? c.travelled : "#123D35"} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {origin && <Pin at={project(origin.coordinate)} kind="origin" dark={dark} />}
      {destination && <Pin at={project(destination.coordinate)} kind="destination" dark={dark} />}
      {position && (
        <g transform={`translate(${project(position).join(",")})`}>
          <circle r={26} fill="#D9F068" opacity={0.35}>
            <animate attributeName="r" values="14;34;14" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r={12} fill="#123D35" stroke="#D9F068" strokeWidth={5} />
        </g>
      )}
    </svg>
  );
}

function Pin({ at, kind, dark }: { at: [number, number]; kind: "origin" | "destination"; dark: boolean }) {
  const [x, y] = at;
  if (kind === "origin")
    return <circle cx={x} cy={y} r={11} fill={dark ? "#F8F6F0" : "#FFFFFF"} stroke="#123D35" strokeWidth={6} />;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M0 0 C -14 -18 -20 -26 -20 -36 A 20 20 0 1 1 20 -36 C 20 -26 14 -18 0 0 Z" fill="#D9F068" stroke="#123D35" strokeWidth={4} />
      <circle cx={0} cy={-36} r={7} fill="#123D35" />
    </g>
  );
}
