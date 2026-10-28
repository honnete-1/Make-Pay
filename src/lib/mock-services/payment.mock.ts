import type { PaymentOutcome, PaymentResult } from "@/types";
import type { PaymentService } from "@/lib/services/contracts";
import { delay, stableCode } from "./latency";

/**
 * SIMULATED MOBILE MONEY (MoMo) COLLECTION
 * ----------------------------------------
 * No request leaves the browser. No PIN is ever requested or handled.
 *
 * Outcome resolution (deterministic):
 *   1. `request.demoOutcome` if provided (chosen in the checkout demo panel)
 *   2. Test numbers: ending in 0000 → failed, ending in 1111 → cancelled
 *   3. Otherwise → success
 */
export const PAYMENT_TIMINGS = { initiatingMs: 700, pendingMs: 2600 } as const;

export function resolveDemoOutcome(msisdn: string, chosen?: PaymentOutcome): PaymentOutcome {
  if (chosen) return chosen;
  if (msisdn.endsWith("0000")) return "failed";
  if (msisdn.endsWith("1111")) return "cancelled";
  return "success";
}

const MESSAGES: Record<PaymentOutcome, string> = {
  success: "Payment approved. The rider has been notified.",
  cancelled: "The payment was declined on the phone.",
  failed: "The mobile-money network did not respond in time.",
};

let attempt = 0;

export const mockPaymentService: PaymentService = {
  async requestPayment(request, onStatus, signal) {
    attempt += 1;
    onStatus("initiating");
    await delay(PAYMENT_TIMINGS.initiatingMs, signal);
    onStatus("pending");
    await delay(PAYMENT_TIMINGS.pendingMs, signal);
    const outcome = resolveDemoOutcome(request.driverMsisdn, request.demoOutcome);
    const status = outcome === "success" ? "successful" : outcome;
    onStatus(status);
    const result: PaymentResult = {
      reference: `TX-${stableCode(`${request.tripId}:${attempt}:${outcome}`, 8)}`,
      status,
      message: MESSAGES[outcome],
      completedAt: new Date().toISOString(),
    };
    return result;
  },
};
