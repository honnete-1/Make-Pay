import type { FareQuote, Tariff } from "@/types";
import type { FareService } from "@/lib/services/contracts";
import { DEMO_TARIFF } from "./fixtures/tariff";

/** Pure, deterministic fare calculation against a tariff. */
export function quoteFare(distanceKm: number, tariff: Tariff = DEMO_TARIFF): FareQuote {
  // Bill on distance rounded to 0.1 km so displayed distance and fare always agree.
  const d = Math.max(0, Math.round(distanceKm * 10) / 10);
  const extraKm = Math.max(0, d - tariff.includedKm);
  const distanceCharge = extraKm * tariff.perKm;
  const raw = tariff.baseFare + distanceCharge;
  const fare = Math.floor(raw / tariff.roundTo + 0.5) * tariff.roundTo;
  return {
    distanceKm: d,
    baseFare: tariff.baseFare,
    distanceCharge: Math.round(distanceCharge),
    fare,
    platformFee: tariff.platformFee,
    total: fare + tariff.platformFee,
    tariffId: tariff.id,
    tariffLabel: tariff.label,
  };
}

export const mockFareService: FareService = {
  getTariff: () => DEMO_TARIFF,
  quote: (km) => quoteFare(km),
};
