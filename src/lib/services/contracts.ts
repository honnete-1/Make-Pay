/**
 * Service contracts — the integration seam between UI and data.
 *
 * Every screen talks to these interfaces only (through `services` in
 * ./index.ts). Today they are backed by deterministic mock implementations in
 * src/lib/mock-services. To go live, implement the same interfaces against
 * production APIs and switch them in ./index.ts — no component changes needed.
 */
import type {
  FareQuote,
  GpsSignal,
  LngLat,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  Place,
  PlaceId,
  RouteSummary,
  Tariff,
} from "@/types";

export interface RoutingService {
  listPlaces(): Promise<Place[]>;
  searchPlaces(query: string): Promise<Place[]>;
  getPlace(id: PlaceId): Place | undefined;
  getRoute(originId: PlaceId, destinationId: PlaceId): Promise<RouteSummary>;
  /** Suggested onward destinations when a passenger extends a ride. */
  getExtensionOptions(fromId: PlaceId, excludeIds: PlaceId[]): Promise<Place[]>;
}

export interface FareService {
  getTariff(): Tariff;
  quote(distanceKm: number): FareQuote;
}

export interface LocationService {
  /** Resolve the passenger's starting point. */
  getCurrentPlace(): Promise<{ place: Place; source: "simulated" | "device" }>;
  /** GPS quality at a point of the ride (mock: deterministic by progress). */
  signalAt(progress: number, online: boolean): GpsSignal;
}

export interface PaymentService {
  /**
   * Initiate a mobile-money collection. Implementations must NEVER ask the
   * passenger for a PIN — approval happens on the payer's own handset.
   */
  requestPayment(
    request: PaymentRequest,
    onStatus: (status: Exclude<PaymentStatus, "idle">) => void,
    signal?: AbortSignal,
  ): Promise<PaymentResult>;
}

export interface Services {
  mode: "mock" | "live";
  routing: RoutingService;
  fare: FareService;
  location: LocationService;
  payment: PaymentService;
}

export type { LngLat };
