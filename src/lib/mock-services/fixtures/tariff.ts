import type { Tariff } from "@/types";

/**
 * ILLUSTRATIVE DEMO TARIFF
 * ------------------------
 * These numbers are assumptions chosen for the product demonstration only.
 * They are NOT an official RURA (Rwanda Utilities Regulatory Authority) tariff
 * and must be replaced by the regulator-approved schedule served from the
 * fare API before any real-world use.
 *
 *   fare = baseFare                                  if distance ≤ includedKm
 *   fare = baseFare + (distance − includedKm) × perKm otherwise
 *   fare is rounded to the nearest `roundTo` RWF (half rounds up)
 *   total = fare + platformFee
 *
 * Example: Downtown → Kimironko ≈ 8.9 km demo route
 *   400 + (8.9 − 2) × 160 = 1,504 → 1,500 RWF fare, + 20 RWF fee = 1,520 RWF
 */
export const DEMO_TARIFF: Tariff = {
  id: "demo-2026-illustrative",
  label: "Illustrative demo tariff",
  currency: "RWF",
  baseFare: 400,
  includedKm: 2,
  perKm: 160,
  roundTo: 50,
  platformFee: 20,
  disclaimer:
    "Illustrative pricing for demonstration only — not an official or regulator-approved fare.",
};

/** Demo average moto speed used to estimate riding time (km/h). */
export const DEMO_AVERAGE_SPEED_KMH = 24;

/** Factor applied to straight graph segments to approximate real road length. */
export const ROUTE_SINUOSITY = 1.16;
