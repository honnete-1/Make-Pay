import { NextResponse } from "next/server";
import type { PaymentOutcome, PaymentRequest, PaymentResult } from "@/types";
import { PAYMENT_TIMINGS, resolveDemoOutcome } from "@/lib/mock-services/payment.mock";
import { delay, stableCode } from "@/lib/mock-services/latency";
import { getSessionId } from "@/lib/server/session";
import { savePayment } from "@/lib/server/store";

const MESSAGES: Record<PaymentOutcome, string> = {
  success: "Payment approved. The rider has been notified.",
  cancelled: "The payment was declined on the phone.",
  failed: "The mobile-money network did not respond in time.",
};

let attempt = 0;

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const request = (await req.json()) as PaymentRequest;
  if (!request.tripId || !request.driverMsisdn || request.total == null) {
    return NextResponse.json({ error: "Invalid payment request" }, { status: 400 });
  }

  await delay(PAYMENT_TIMINGS.initiatingMs + PAYMENT_TIMINGS.pendingMs);
  attempt += 1;
  const outcome = resolveDemoOutcome(request.driverMsisdn, request.demoOutcome);
  const status = outcome === "success" ? "successful" : outcome;
  const result: PaymentResult = {
    reference: `TX-${stableCode(`${request.tripId}:${attempt}:${outcome}`, 8)}`,
    status,
    message: MESSAGES[outcome],
    completedAt: new Date().toISOString(),
  };
  savePayment(sessionId, request.tripId, result);
  return NextResponse.json(result);
}
