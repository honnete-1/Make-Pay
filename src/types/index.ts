/**
 * Shared domain types for Mâke pay.
 * These shapes are the contract between the UI and the service layer —
 * mock services implement them today, real APIs will implement them later.
 */

/** [longitude, latitude] — the GeoJSON / MapLibre order. */
export type LngLat = [number, number];

export type PlaceId = string;

export interface Place {
  id: PlaceId;
  name: string;
  /** Short neighbourhood / landmark descriptor, e.g. "Kigali City Tower". */
  area: string;
  coordinate: LngLat;
  /** Search aliases (lower-case). */
  keywords: string[];
}

export interface RouteSummary {
  /** Stable id, e.g. "downtown__remera". */
  id: string;
  originId: PlaceId;
  destinationId: PlaceId;
  /** Polyline of the recommended route. */
  path: LngLat[];
  /** Demonstration road distance in kilometres. */
  distanceKm: number;
  /** Demonstration riding time in minutes at the demo average speed. */
  durationMin: number;
  /** Names of the roads / junctions passed — for the route description. */
  via: string[];
}

export interface Tariff {
  id: string;
  label: string;
  currency: "RWF";
  baseFare: number;
  includedKm: number;
  perKm: number;
  roundTo: number;
  platformFee: number;
  /** Plain-language disclaimer shown wherever this tariff is applied. */
  disclaimer: string;
}

export interface FareQuote {
  distanceKm: number;
  baseFare: number;
  distanceCharge: number;
  /** Rider fare after rounding. */
  fare: number;
  platformFee: number;
  total: number;
  tariffId: string;
  tariffLabel: string;
}

export type GpsSignal = "strong" | "weak" | "searching" | "offline";

export type TripStatus = "active" | "arrived" | "completed";

export interface Trip {
  id: string;
  route: RouteSummary;
  /** Destination extensions appended during the ride. */
  extensions: RouteSummary[];
  /** Full path the simulator follows (route.path + extensions). */
  path: LngLat[];
  plannedDistanceKm: number;
  totalDistanceKm: number;
  travelledKm: number;
  /** Simulated seconds elapsed in the ride. */
  elapsedSec: number;
  status: TripStatus;
  startedAt: string;
  endedAt?: string;
}

export interface TripSummary {
  tripId: string;
  originId: PlaceId;
  destinationId: PlaceId;
  plannedDistanceKm: number;
  travelledKm: number;
  extraKm: number;
  elapsedSec: number;
  plannedQuote: FareQuote;
  finalQuote: FareQuote;
  startedAt: string;
  endedAt: string;
}

export type PaymentOutcome = "success" | "cancelled" | "failed";

export type PaymentStatus = "idle" | "initiating" | "pending" | "successful" | "cancelled" | "failed";

export interface PaymentRequest {
  tripId: string;
  driverMsisdn: string;
  fare: number;
  platformFee: number;
  total: number;
  /** Demo only: which outcome the simulator should produce. */
  demoOutcome?: PaymentOutcome;
}

export interface PaymentResult {
  reference: string;
  status: Exclude<PaymentStatus, "idle" | "initiating" | "pending">;
  message: string;
  completedAt: string;
}

export interface Receipt {
  id: string;
  tripId: string;
  originId: PlaceId;
  destinationId: PlaceId;
  originName: string;
  destinationName: string;
  distanceKm: number;
  extraKm: number;
  durationSec: number;
  fare: number;
  platformFee: number;
  total: number;
  driverMsisdnMasked: string;
  paymentReference: string;
  paymentStatus: PaymentResult["status"];
  tariffLabel: string;
  issuedAt: string;
  isDemo: true;
}
