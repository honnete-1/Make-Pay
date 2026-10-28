import type { LngLat } from "@/types";

const R = 6371; // km

export function haversineKm(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLengthKm(path: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += haversineKm(path[i - 1]!, path[i]!);
  return total;
}

/**
 * Returns the point at `fraction` (0–1) of the path's length plus the
 * already-travelled portion of the path, ready to draw as a line.
 */
export function pointAlong(path: LngLat[], fraction: number): { point: LngLat; travelled: LngLat[]; bearing: number } {
  if (path.length === 0) return { point: [0, 0], travelled: [], bearing: 0 };
  const f = Math.min(1, Math.max(0, fraction));
  const total = pathLengthKm(path);
  const target = total * f;
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const seg = haversineKm(a, b);
    if (acc + seg >= target || i === path.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, (target - acc) / seg);
      const point: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      return { point, travelled: [...path.slice(0, i), point], bearing: bearing(a, b) };
    }
    acc += seg;
  }
  const last = path[path.length - 1]!;
  return { point: last, travelled: path, bearing: 0 };
}

export function bearing(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(b[0] - a[0])) * Math.cos(toRad(b[1]));
  const x =
    Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
    Math.sin(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.cos(toRad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function bounds(path: LngLat[]): [LngLat, LngLat] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of path) {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  return [[minX, minY], [maxX, maxY]];
}

/**
 * Adds gentle, deterministic curvature between straight graph segments so the
 * demonstration polyline reads more like a road. Pure function: the same
 * input always produces the same output.
 */
export function smoothPath(path: LngLat[], steps = 6): LngLat[] {
  if (path.length < 3) return path;
  const out: LngLat[] = [path[0]!];
  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[Math.max(0, i - 1)]!;
    const p1 = path[i]!;
    const p2 = path[i + 1]!;
    const p3 = path[Math.min(path.length - 1, i + 2)]!;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      // Centripetal-ish Catmull–Rom with tension 0.5
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  return out;
}
