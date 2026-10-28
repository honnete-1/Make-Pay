import type { LocationService } from "@/lib/services/contracts";
import { PLACES } from "./fixtures/kigali-graph";
import { delay } from "./latency";
import { mockSignalAt } from "./trip-simulator";

/** Simulated location: the demo always starts Downtown. No device GPS is read. */
export const mockLocationService: LocationService = {
  async getCurrentPlace() {
    await delay(500);
    return { place: PLACES[0]!, source: "simulated" };
  },
  signalAt: mockSignalAt,
};
