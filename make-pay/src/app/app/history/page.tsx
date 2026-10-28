"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, ReceiptText, Trash2 } from "lucide-react";
import { AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { StatusPill } from "@/components/payment/receipt-view";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useT } from "@/i18n";
import { formatDateTime, formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";

export default function TripsPage() {
  const hydrated = useHydrated();
  const t = useT();
  const { receipts, clearHistory } = useTripStore();
  const [confirm, setConfirm] = useState(false);

  if (!hydrated) return <LoadingScreen />;

  const total = receipts.filter((r) => r.paymentStatus === "successful").reduce((s, r) => s + r.total, 0);

  return (
    <>
      <AppHeader title={t.trips.title} />
      <PageColumn>
        {receipts.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title={t.trips.empty} body={t.trips.emptyBody} action={<Button asChild><Link href="/app">{t.journey.plan}</Link></Button>} />
        ) : (
          <>
            <div className="rounded-[26px] bg-forest p-5 text-cream">
              <p className="text-[13px] text-cream/70">{t.trips.count(receipts.length)}</p>
              <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-lime tabular">{formatRWF(total)}</p>
              <p className="text-[13px] text-cream/70">{t.trips.totalPaid}</p>
            </div>

            <ul className="mt-4 space-y-2">
              {receipts.map((r, i) => (
                <motion.li key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/app/receipt/${r.id}`} className="flex items-center gap-3 rounded-[20px] bg-white p-4 transition-colors hover:bg-white/70">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold text-ink">{r.originName} → {r.destinationName}</p>
                      <p className="text-[13px] text-ink-soft">{formatDateTime(r.issuedAt)} · {r.distanceKm.toFixed(1)} km</p>
                      <StatusPill status={r.paymentStatus} className="mt-1.5" />
                    </div>
                    <p className="shrink-0 font-display text-xl font-semibold text-forest tabular">{formatRWF(r.total)}</p>
                    <ChevronRight className="size-4 shrink-0 text-ink-soft" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              {confirm ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[14px] text-ink-soft">{t.trips.clearConfirm}</span>
                  <Button size="sm" variant="danger" onClick={() => { clearHistory(); setConfirm(false); }}>{t.trips.delete}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>{t.trips.keep}</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}><Trash2 /> {t.trips.clear}</Button>
              )}
            </div>
          </>
        )}
      </PageColumn>
    </>
  );
}
