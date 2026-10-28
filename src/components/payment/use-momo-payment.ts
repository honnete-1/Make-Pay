"use client";

import { useCallback, useRef, useState } from "react";
import type { PaymentRequest, PaymentResult, PaymentStatus } from "@/types";
import { services } from "@/lib/services";

/** Payment state machine around the PaymentService. */
export function useMomoPayment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const pay = useCallback(async (req: PaymentRequest) => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setResult(null);
    setError(null);
    try {
      const r = await services.payment.requestPayment(req, setStatus, ctrl.signal);
      setResult(r);
      return r;
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setStatus("idle");
        return null;
      }
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Payment could not be started.");
      return null;
    }
  }, []);

  const cancel = useCallback(() => abort.current?.abort(), []);
  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, pay, cancel, reset };
}
