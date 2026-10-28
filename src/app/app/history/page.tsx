"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, ReceiptText, Trash2 } from "lucide-react";
import { AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { StatusPill } from "@/components/payment/receipt-view";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDateTime, formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";

export default function HistoryPage() {
  const hydrated = useHydrated();
  const { receipts, clearHistory } = useTripStore();
  const [confirm, setConfirm] = useState(false);

  if (!hydrated) return <LoadingScreen />;

  const total = receipts.filter((r) => r.paymentStatus === "successful").reduce((s, r) => s + r.total, 0);

  return (
    <>
      <AppHeader back="/app" title="Trip history" right={<span />} />
      <PageColumn>
        {receipts.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="No trips yet"
            body="Completed journeys and their receipts will appear here."
            action={<Button asChild><Link href="/app">Plan a journey</Link></Button>}
          />
        ) : (
          <>
            <div className="rounded-[var(--radius-card)] bg-forest p-6 text-cream">
              <p className="text-[13px] text-cream/70">{receipts.length} trips on this device</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-lime tabular">{formatRWF(total)}</p>
              <p className="text-[13px] text-cream/70">Total paid</p>
            </div>

            <ul className="mt-5 space-y-2">
              {receipts.map((r, i) => (
                <motion.li key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/app/receipt/${r.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 transition-colors hover:bg-white/70">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold text-ink">{r.originName} → {r.destinationName}</p>
                      <p className="text-[13px] text-ink-soft">{formatDateTime(r.issuedAt)} · {r.distanceKm.toFixed(1)} km</p>
                      <StatusPill status={r.paymentStatus} className="mt-1.5" />
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-semibold text-forest tabular">{formatRWF(r.total)}</p>
                      <p className="text-[12px] text-ink-soft">{r.id}</p>
                    </div>
                    <ChevronRight className="size-4 text-ink-soft" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              {confirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-ink-soft">Delete all trips?</span>
                  <Button size="sm" variant="danger" onClick={() => { clearHistory(); setConfirm(false); }}>Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Keep</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}><Trash2 /> Clear history</Button>
              )}
            </div>
          </>
        )}
      </PageColumn>
    </>
  );
}
