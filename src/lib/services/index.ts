import type { Services } from "./contracts";
import { mockRoutingService } from "@/lib/mock-services/routing.mock";
import { mockFareService } from "@/lib/mock-services/fare.mock";
import { mockLocationService } from "@/lib/mock-services/location.mock";
import { mockPaymentService } from "@/lib/mock-services/payment.mock";
import { liveServices } from "./live";

/**
 * Service registry. Components import `services` and never a mock directly.
 *
 * Default is live (same-origin /api). Set NEXT_PUBLIC_USE_MOCKS=true to force
 * the in-browser mocks. Secrets must stay server-side in Route Handlers.
 */
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const mockServices: Services = {
  mode: "mock",
  routing: mockRoutingService,
  fare: mockFareService,
  location: mockLocationService,
  payment: mockPaymentService,
};

export const services: Services = useMocks ? mockServices : liveServices;
export const IS_DEMO = services.mode === "mock";

export type { Services } from "./contracts";
export { fetchReceipts, postReceipt, deleteReceipts, postTrip, patchTrip } from "./live";
