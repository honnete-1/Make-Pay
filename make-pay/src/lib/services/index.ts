import type { Services } from "./contracts";
import { routingProvider } from "@/lib/maps/routing-provider";
import { mockFareService } from "@/lib/mock-services/fare.mock";
import { mockLocationService } from "@/lib/mock-services/location.mock";
import { mockPaymentService } from "@/lib/mock-services/payment.mock";
import { liveServices } from "./live";

/**
 * Service registry. Components import `services` and never a mock directly.
 *
 * NEXT_PUBLIC_USE_MOCKS=false switches to the HTTP adapters in ./live.ts,
 * which are typed stubs today. Secrets (MoMo API keys, routing keys) must
 * live server-side — call them from Route Handlers, never from the browser.
 */
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

const mockServices: Services = {
  mode: "mock",
  routing: routingProvider,
  fare: mockFareService,
  location: mockLocationService,
  payment: mockPaymentService,
};

export const services: Services = useMocks ? mockServices : liveServices;
export const IS_DEMO = services.mode === "mock";
export { GOOGLE_ENABLED } from "@/lib/maps/config";

export type { Services } from "./contracts";
