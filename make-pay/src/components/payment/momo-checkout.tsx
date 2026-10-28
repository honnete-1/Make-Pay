"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Ban, Loader2, Lock, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";
import type { PaymentOutcome } from "@/types";
import { ActionBar, AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useMomoPayment } from "./use-momo-payment";
import { useHydrated } from "@/hooks/use-hydrated";
import { msisdnSchema, formatMsisdn, maskMsisdn, normalizeMsisdn } from "@/lib/phone";
import { buildReceipt } from "@/lib/mock-services/receipt.mock";
import { PAYMENT_TIMINGS } from "@/lib/mock-services/payment.mock";
import { formatRWF } from "@/lib/format";
import { services } from "@/lib/services";
import { useTripStore } from "@/store/trip-store";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const schema = z.object({ msisdn: msisdnSchema });
type FormIn = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

const OUTCOMES: PaymentOutcome[] = ["success", "cancelled", "failed"];

export function MomoCheckout() {
  const hydrated = useHydrated();
  const router = useRouter();
  const t = useT();
  const { summary, addReceipt } = useTripStore();
  const { status, result, error, pay, cancel, reset } = useMomoPayment();
  const [outcome, setOutcome] = useState<PaymentOutcome>("success");
  const [msisdn, setMsisdn] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { msisdn: "" } });

  const busy = status === "initiating" || status === "pending";

  useEffect(() => {
    if (status !== "successful" || !result || !summary) return;
    const receipt = buildReceipt(summary, result, msisdn);
    addReceipt(receipt);
    const t = setTimeout(() => router.push(`/app/receipt/${receipt.id}?new=1`), 1200);
    return () => clearTimeout(t);
  }, [status, result, summary, msisdn, addReceipt, router]);

  if (!hydrated) return <LoadingScreen />;
  if (!summary) {
    return (
      <>
        <AppHeader back="/app" title={t.pay.title} />
        <EmptyState icon={<Smartphone />} title={t.pay.nothing} body={t.pay.nothingBody} action={<Button onClick={() => router.push("/app")}>{t.journey.plan}</Button>} />
      </>
    );
  }

  const q = summary.finalQuote;
  const origin = services.routing.getPlace(summary.originId);
  const destination = services.routing.getPlace(summary.destinationId);

  const onSubmit = (data: FormOut) => {
    setMsisdn(data.msisdn);
    void pay({ tripId: summary.tripId, driverMsisdn: data.msisdn, fare: q.fare, platformFee: q.platformFee, total: q.total, demoOutcome: outcome === "success" ? undefined : outcome });
  };

  const field = register("msisdn");

  return (
    <>
      <AppHeader back={busy ? undefined : "/app/journey/complete"} title="MTN MoMo" />
      <PageColumn>
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.form key="form" id="checkout" onSubmit={handleSubmit(onSubmit)} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <p className="text-[15px] text-ink-soft">{origin?.name} → {destination?.name}</p>
              <h2 className="font-display text-[2.4rem] font-medium leading-none tracking-[-0.04em] text-forest">{t.pay.title}</h2>

              <div className="mt-7 space-y-2">
                <Label htmlFor="msisdn">{t.pay.numberLabel}</Label>
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-stone px-1.5 py-0.5 text-[11px] font-semibold text-forest">RW</span>
                  <Input
                    id="msisdn"
                    inputMode="tel"
                    autoComplete="off"
                    placeholder="078 812 3456"
                    aria-invalid={!!errors.msisdn}
                    aria-describedby="msisdn-help"
                    className="pl-12 text-lg tracking-wide tabular"
                    {...field}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const formatted = raw.trim().startsWith("+") ? raw : formatMsisdn(raw);
                      setValue("msisdn", formatted, { shouldValidate: isSubmitted || normalizeMsisdn(formatted).length >= 10 });
                    }}
                  />
                </div>
                <p id="msisdn-help" className={cn("flex items-center gap-1.5 text-[13px]", errors.msisdn ? "text-danger" : "text-ink-soft")} role={errors.msisdn ? "alert" : undefined}>
                  {errors.msisdn ? <><AlertCircle className="size-3.5" /> {t.pay.errors[(errors.msisdn.message ?? "empty") as keyof typeof t.pay.errors] ?? errors.msisdn.message}</> : t.pay.numberHelp}
                </p>
              </div>

              <section aria-labelledby="bd-h" className="mt-6 rounded-[1.5rem] bg-white p-5">
                <h3 id="bd-h" className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.pay.breakdown}</h3>
                <dl className="mt-3 space-y-2.5 text-[15px] tabular">
                  <div className="flex justify-between"><dt className="text-ink-soft">{t.fare.transportFare} · {q.distanceKm.toFixed(1)} km</dt><dd className="text-ink">{formatRWF(q.fare)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-soft">{t.fare.platformFee}</dt><dd className="text-ink">{formatRWF(q.platformFee)}</dd></div>
                  <div className="h-px bg-stone" />
                  <div className="flex items-baseline justify-between"><dt className="font-semibold text-ink">{t.fare.total}</dt><dd className="font-display text-3xl font-semibold text-forest">{formatRWF(q.total)}</dd></div>
                </dl>
              </section>

              <div className="mt-4 flex gap-3 rounded-2xl bg-forest/6 p-4 text-[13px] text-forest">
                <Lock className="mt-0.5 size-4 shrink-0" />
                <p><span className="font-semibold">{t.pay.noPin}</span> {t.pay.noPinMore}</p>
              </div>

              <fieldset className="mt-6 rounded-2xl border border-dashed border-forest/25 p-4">
                <legend className="px-2 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.pay.outcome}</legend>
                <div role="radiogroup" aria-label={t.pay.outcome} className="grid grid-cols-3 gap-1 rounded-full bg-stone p-1">
                  {OUTCOMES.map((o) => (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={outcome === o}
                      onClick={() => setOutcome(o)}
                      className={cn("min-h-10 truncate rounded-full px-1 text-[13px] font-medium transition-colors", outcome === o ? "bg-white text-forest shadow-sm" : "text-ink-soft")}
                    >
                      {t.pay.outcomes[o]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-ink-soft">{t.pay.outcomeHelp}</p>
              </fieldset>
            </motion.form>
          )}

          {busy && (
            <motion.div key="pending" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pt-10 text-center" role="status" aria-live="polite">
              <div className="relative grid size-28 place-items-center">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-lime" />
                <span className="absolute inset-3 animate-pulse-ring rounded-full bg-lime [animation-delay:600ms]" />
                <span className="relative grid size-20 place-items-center rounded-full bg-forest text-lime">
                  {status === "initiating" ? <Loader2 className="size-8 animate-spin" /> : <Smartphone className="size-8" />}
                </span>
              </div>
              <h2 className="mt-8 font-display text-3xl font-semibold tracking-tight text-forest">
                {status === "initiating" ? t.pay.sending : t.pay.waiting}
              </h2>
              <p className="mt-2 max-w-sm text-[15px] text-ink-soft">
                {status === "initiating" ? t.pay.sendingBody(formatRWF(q.total), maskMsisdn(msisdn)) : t.pay.waitingBody}
              </p>
              <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-stone">
                <motion.div
                  key={status}
                  className="h-full bg-forest"
                  initial={{ width: status === "initiating" ? "0%" : "22%" }}
                  animate={{ width: status === "initiating" ? "22%" : "100%" }}
                  transition={{ duration: (status === "initiating" ? PAYMENT_TIMINGS.initiatingMs : PAYMENT_TIMINGS.pendingMs) / 1000, ease: "linear" }}
                />
              </div>
              <p className="mt-6 flex items-center gap-1.5 text-[13px] text-forest"><ShieldCheck className="size-4" /> {t.pay.noPin}</p>
              {status === "pending" && (
                <Button variant="ghost" className="mt-6" onClick={cancel}>{t.pay.cancelRequest}</Button>
              )}
            </motion.div>
          )}

          {status === "successful" && (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-14 text-center" role="status">
              <motion.svg viewBox="0 0 80 80" className="size-24" aria-hidden>
                <circle cx="40" cy="40" r="38" fill="#C7E874" />
                <motion.path d="M24 41 l11 11 l22 -24" fill="none" stroke="#173C32" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.15 }} />
              </motion.svg>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-forest">{t.pay.success}</h2>
              <p className="mt-2 text-ink-soft">{t.pay.successBody(formatRWF(q.total))}</p>
              <p className="mt-6 flex items-center gap-2 text-[14px] text-ink-soft"><Loader2 className="size-4 animate-spin" /> {t.pay.preparing}</p>
            </motion.div>
          )}

          {(status === "cancelled" || status === "failed") && (
            <motion.div key="err" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-12 text-center" role="alert">
              <span className={cn("grid size-20 place-items-center rounded-full", status === "failed" ? "bg-danger/10 text-danger" : "bg-stone text-ink")}>
                {status === "failed" ? <AlertCircle className="size-9" /> : <Ban className="size-9" />}
              </span>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-forest">{status === "failed" ? t.pay.failed : t.pay.cancelled}</h2>
              <p className="mt-2 max-w-sm text-[15px] text-ink-soft">{status === "failed" ? t.pay.failedBody : t.pay.cancelledBody}</p>
              {result && <p className="mt-2 text-[12px] text-ink-soft">{t.receipt.ref} {result.reference}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </PageColumn>

      {(status === "idle" || status === "cancelled" || status === "failed") && (
        <ActionBar>
          {status === "idle" ? (
            <Button type="submit" form="checkout" size="xl" block>
              {t.pay.confirm(formatRWF(q.total))}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="xl" className="flex-1 px-3" onClick={reset}>{t.pay.change}</Button>
              <Button
                size="xl"
                className="flex-1"
                onClick={() => pay({ tripId: summary.tripId, driverMsisdn: msisdn, fare: q.fare, platformFee: q.platformFee, total: q.total, demoOutcome: outcome === "success" ? undefined : outcome })}
              >
                <RotateCcw /> {t.common.tryAgain}
              </Button>
            </div>
          )}
        </ActionBar>
      )}
    </>
  );
}
