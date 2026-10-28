import type { FareQuote, PaymentRequest, PaymentResult, Place, PlaceId, RouteSummary, Tariff } from "@/types";
import type { Services } from "./contracts";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { DEMO_TARIFF } from "@/lib/mock-services/fixtures/tariff";
import { mockLocationService } from "@/lib/mock-services/location.mock";
import { getPlaceSync } from "@/lib/mock-services/routing.mock";
import { PAYMENT_TIMINGS } from "@/lib/mock-services/payment.mock";
import { haversineKm } from "@/lib/geo";
import { PLACES } from "@/lib/mock-services/fixtures/kigali-graph";

/**
 * LIVE ADAPTERS — same-origin /api backed by in-memory arrays (+ data/store.json).
 * Set NEXT_PUBLIC_API_BASE_URL only when the API lives on another origin.
 */
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    credentials: "same-origin",
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

let tariffCache: Tariff | null = null;

export const liveServices: Services = {
  mode: "live",
  routing: {
    listPlaces: () => http<Place[]>("/api/places"),
    searchPlaces: (q) => http<Place[]>(`/api/places?q=${encodeURIComponent(q)}`),
    getPlace: getPlaceSync,
    getRoute: (originId, destinationId) =>
      http<RouteSummary>("/api/routes", {
        method: "POST",
        body: JSON.stringify({ originId, destinationId }),
      }),
    async getExtensionOptions(fromId, excludeIds) {
      const from = getPlaceSync(fromId);
      if (!from) return [];
      return PLACES.filter((p) => p.id !== fromId && !excludeIds.includes(p.id))
        .map((p) => ({ p, d: haversineKm(from.coordinate, p.coordinate) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map(({ p }) => p);
    },
  },
  fare: {
    getTariff() {
      if (tariffCache) return tariffCache;
      // Sync contract — use fixture; hydrate cache in background.
      void http<Tariff>("/api/tariff").then((t) => {
        tariffCache = t;
      });
      return DEMO_TARIFF;
    },
    quote(distanceKm: number): FareQuote {
      return quoteFare(distanceKm, tariffCache ?? DEMO_TARIFF);
    },
  },
  location: mockLocationService,
  payment: {
    async requestPayment(request: PaymentRequest, onStatus, signal) {
      onStatus("initiating");
      const pendingTimer = setTimeout(() => {
        if (!signal?.aborted) onStatus("pending");
      }, PAYMENT_TIMINGS.initiatingMs);
      try {
        const result = await http<PaymentResult>("/api/payments", {
          method: "POST",
          body: JSON.stringify(request),
          signal,
        });
        onStatus(result.status);
        return result;
      } finally {
        clearTimeout(pendingTimer);
      }
    },
  },
};

export async function fetchReceipts() {
  return http<import("@/types").Receipt[]>("/api/receipts");
}

export async function postReceipt(receipt: import("@/types").Receipt) {
  return http<import("@/types").Receipt>("/api/receipts", {
    method: "POST",
    body: JSON.stringify(receipt),
  });
}

export async function deleteReceipts() {
  return http<{ ok: boolean }>("/api/receipts", { method: "DELETE" });
}

export async function postTrip(input: RouteSummary | import("@/types").Trip) {
  const body = "path" in input && "status" in input ? { trip: input } : { route: input };
  return http<import("@/types").Trip>("/api/trips", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchTrip(
  id: string,
  body: {
    action?: "extend" | "complete" | "sync";
    extension?: RouteSummary;
    trip?: import("@/types").Trip;
    summary?: import("@/types").TripSummary;
  },
) {
  return http(`/api/trips/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
