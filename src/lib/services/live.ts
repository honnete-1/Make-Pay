import type { Services } from "./contracts";
import { mockFareService } from "@/lib/mock-services/fare.mock";
import { mockLocationService } from "@/lib/mock-services/location.mock";
import { mockRoutingService } from "@/lib/mock-services/routing.mock";

/**
 * LIVE ADAPTERS — integration placeholders.
 *
 * Each method documents the endpoint it is expected to call. Until a backend
 * exists, unimplemented methods throw a clear error rather than pretending.
 * Suggested backend routes (implement as Next.js Route Handlers or a
 * separate API so secrets stay server-side):
 *
 *   GET  /api/places?q=                 → Place[]
 *   POST /api/routes { origin, dest }   → RouteSummary   (OSRM / Valhalla / Google)
 *   GET  /api/tariff                    → Tariff         (regulator schedule)
 *   POST /api/payments                  → { reference }  (MTN MoMo Collections: requesttopay)
 *   GET  /api/payments/:ref             → PaymentResult  (poll or webhook)
 */
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  const res = await fetch(`${API}${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const liveServices: Services = {
  mode: "live",
  routing: {
    ...mockRoutingService,
    searchPlaces: (q) => http(`/api/places?q=${encodeURIComponent(q)}`),
    getRoute: (originId, destinationId) =>
      http(`/api/routes`, { method: "POST", body: JSON.stringify({ originId, destinationId }) }),
  },
  fare: mockFareService, // replace with GET /api/tariff + server-side quoting
  location: mockLocationService, // replace with navigator.geolocation + map-matching
  payment: {
    async requestPayment() {
      throw new Error("Live payments are not implemented in the frontend phase.");
    },
  },
};
