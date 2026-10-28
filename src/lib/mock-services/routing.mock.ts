import type { Place, PlaceId, RouteSummary } from "@/types";
import type { RoutingService } from "@/lib/services/contracts";
import { haversineKm, smoothPath } from "@/lib/geo";
import { EDGES, NODES, PLACES } from "./fixtures/kigali-graph";
import { DEMO_AVERAGE_SPEED_KMH, ROUTE_SINUOSITY } from "./fixtures/tariff";
import { delay } from "./latency";

/** Adjacency list built once from the demo graph. */
const ADJ: Record<string, { to: string; km: number }[]> = (() => {
  const adj: Record<string, { to: string; km: number }[]> = {};
  for (const [a, b] of EDGES) {
    const km = haversineKm(NODES[a]!.coordinate, NODES[b]!.coordinate);
    (adj[a] ??= []).push({ to: b, km });
    (adj[b] ??= []).push({ to: a, km });
  }
  return adj;
})();

/** Plain Dijkstra — the graph is tiny, so an O(n²) scan is fine. */
function shortestPath(from: string, to: string): { nodes: string[]; km: number } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | undefined> = {};
  const open = new Set(Object.keys(NODES));
  for (const id of open) dist[id] = Infinity;
  dist[from] = 0;
  while (open.size) {
    let u: string | undefined;
    for (const id of open) if (u === undefined || dist[id]! < dist[u]!) u = id;
    if (u === undefined || dist[u] === Infinity) break;
    open.delete(u);
    if (u === to) break;
    for (const { to: v, km } of ADJ[u] ?? []) {
      if (!open.has(v)) continue;
      const alt = dist[u]! + km;
      if (alt < dist[v]!) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }
  if (dist[to] === Infinity) throw new Error(`No demo route between ${from} and ${to}`);
  const nodes = [to];
  while (nodes[0] !== from) nodes.unshift(prev[nodes[0]!]!);
  return { nodes, km: dist[to]! };
}

const routeCache = new Map<string, RouteSummary>();

/** Synchronous, deterministic route computation (also used by the landing page). */
export function computeRoute(originId: PlaceId, destinationId: PlaceId): RouteSummary {
  const id = `${originId}__${destinationId}`;
  const cached = routeCache.get(id);
  if (cached) return cached;
  const { nodes, km } = shortestPath(originId, destinationId);
  const distanceKm = Math.round(km * ROUTE_SINUOSITY * 10) / 10;
  const route: RouteSummary = {
    id,
    originId,
    destinationId,
    path: smoothPath(nodes.map((n) => NODES[n]!.coordinate)),
    distanceKm,
    durationMin: Math.max(3, Math.round((distanceKm / DEMO_AVERAGE_SPEED_KMH) * 60)),
    via: nodes.slice(1, -1).map((n) => NODES[n]!.label),
  };
  routeCache.set(id, route);
  return route;
}

export function getPlaceSync(id: PlaceId): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export const mockRoutingService: RoutingService = {
  async listPlaces() {
    await delay(120);
    return PLACES;
  },
  async searchPlaces(query) {
    await delay(180);
    const q = query.trim().toLowerCase();
    if (!q) return PLACES;
    return PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q)),
    );
  },
  getPlace: getPlaceSync,
  async getRoute(originId, destinationId) {
    await delay(650);
    if (originId === destinationId) throw new Error("Choose a destination different from your starting point.");
    return computeRoute(originId, destinationId);
  },
  async getExtensionOptions(fromId, excludeIds) {
    await delay(250);
    const from = getPlaceSync(fromId);
    if (!from) return [];
    return PLACES.filter((p) => p.id !== fromId && !excludeIds.includes(p.id))
      .map((p) => ({ p, d: haversineKm(from.coordinate, p.coordinate) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map(({ p }) => p);
  },
};
