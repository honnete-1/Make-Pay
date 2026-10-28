import type { PaymentResult, Receipt, TripSummary } from "@/types";
import { DEMO_TARIFF } from "./fixtures/tariff";
import { getPlaceSync, computeRoute } from "./routing.mock";
import { quoteFare } from "./fare.mock";
import { stableCode } from "./latency";
import { maskMsisdn } from "@/lib/phone";

export function buildReceipt(summary: TripSummary, payment: PaymentResult, driverMsisdn: string): Receipt {
  return {
    id: `MP-${stableCode(summary.tripId, 6)}`,
    tripId: summary.tripId,
    originId: summary.originId,
    destinationId: summary.destinationId,
    originName: getPlaceSync(summary.originId)?.name ?? summary.originId,
    destinationName: getPlaceSync(summary.destinationId)?.name ?? summary.destinationId,
    distanceKm: summary.travelledKm,
    extraKm: summary.extraKm,
    durationSec: summary.elapsedSec,
    fare: summary.finalQuote.fare,
    platformFee: summary.finalQuote.platformFee,
    total: summary.finalQuote.total,
    driverMsisdnMasked: maskMsisdn(driverMsisdn),
    paymentReference: payment.reference,
    paymentStatus: payment.status,
    tariffLabel: DEMO_TARIFF.label,
    issuedAt: payment.completedAt,
    isDemo: true,
  };
}

/** Deterministic seed history so the History screen never starts empty. */
function seed(originId: string, destinationId: string, issuedAt: string, msisdn: string): Receipt {
  const route = computeRoute(originId, destinationId);
  const q = quoteFare(route.distanceKm);
  return {
    id: `MP-${stableCode(`seed:${originId}:${destinationId}:${issuedAt}`, 6)}`,
    tripId: `seed_${originId}_${destinationId}`,
    originId,
    destinationId,
    originName: getPlaceSync(originId)!.name,
    destinationName: getPlaceSync(destinationId)!.name,
    distanceKm: route.distanceKm,
    extraKm: 0,
    durationSec: route.durationMin * 60,
    fare: q.fare,
    platformFee: q.platformFee,
    total: q.total,
    driverMsisdnMasked: maskMsisdn(msisdn),
    paymentReference: `DEMO-${stableCode(issuedAt, 8)}`,
    paymentStatus: "successful",
    tariffLabel: DEMO_TARIFF.label,
    issuedAt,
    isDemo: true,
  };
}

export const SEED_HISTORY: Receipt[] = [
  seed("kimironko", "cbd", "2026-10-26T17:42:00+02:00", "0788123456"),
  seed("cbd", "kacyiru", "2026-10-24T08:15:00+02:00", "0791234567"),
  seed("nyabugogo", "cbd", "2026-10-21T19:03:00+02:00", "0782345678"),
];
