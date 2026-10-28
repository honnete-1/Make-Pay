"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, FileX, History, Plus, Share2 } from "lucide-react";
import type { Receipt } from "@/types";
import { ActionBar, AppHeader, EmptyState, LoadingScreen, PageColumn } from "@/components/app/app-chrome";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDateTime, formatMinutes, formatRWF } from "@/lib/format";
import { useTripStore } from "@/store/trip-store";
import { cn } from "@/lib/utils";

export function receiptText(r: Receipt) {
  return [
    `Mâke pay receipt ${r.id}`,
    `${r.originName} → ${r.destinationName}`,
    formatDateTime(r.issuedAt),
    `Distance: ${r.distanceKm.toFixed(1)} km`,
    `Fare: ${formatRWF(r.fare)}`,
    `Platform fee: ${formatRWF(r.platformFee)}`,
    `Total: ${formatRWF(r.total)}`,
    `Status: ${r.paymentStatus} · Ref ${r.paymentReference}`,
  ].join("\n");
}

export function ReceiptView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fresh = useSearchParams().get("new") === "1";
  const receipt = useTripStore((s) => s.receipts.find((r) => r.id === params.id));
  const [copied, setCopied] = useState(false);

  // A fresh receipt closes the journey so the next trip starts clean.
  useEffect(() => {
    if (hydrated && fresh) useTripStore.getState().resetJourney();
  }, [hydrated, fresh]);

  if (!hydrated) return <LoadingScreen />;
  if (!receipt) {
    return (
      <>
        <AppHeader back="/app/history" title="Receipt" />
        <EmptyState icon={<FileX />} title="Receipt not found" body="This receipt isn’t stored on this device." action={<Button onClick={() => router.push("/app/history")}>View history</Button>} />
      </>
    );
  }

  const share = async () => {
    const text = receiptText(receipt);
    try {
      if (navigator.share) await navigator.share({ title: `Mâke pay receipt ${receipt.id}`, text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  const rows: [string, string][] = [
    ["Date & time", formatDateTime(receipt.issuedAt)],
    ["From", receipt.originName],
    ["To", receipt.destinationName],
    ["Distance", `${receipt.distanceKm.toFixed(1)} km${receipt.extraKm > 0 ? ` (incl. +${receipt.extraKm.toFixed(1)} km extension)` : ""}`],
    ["Ride time", formatMinutes(receipt.durationSec)],
    ["Rider MoMo", receipt.driverMsisdnMasked],
    ["Tariff", receipt.tariffLabel],
  ];

  return (
    <>
      <AppHeader back="/app/history" title="Receipt" />
      <PageColumn>
        {fresh && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3 rounded-2xl bg-lime px-4 py-3 text-forest">
            <Check className="size-5" strokeWidth={3} />
            <p className="text-[15px] font-semibold">Payment confirmed · receipt saved</p>
          </motion.div>
        )}
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-[var(--radius-card)] bg-white p-6 shadow-float md:p-8" aria-labelledby="rcpt-h">
          <LogoMark className="size-10" />
          <h2 id="rcpt-h" className="mt-6 text-[13px] uppercase tracking-[0.14em] text-ink-soft">Receipt {receipt.id}</h2>
          <p className="mt-1 font-display text-5xl font-semibold tracking-tight text-forest tabular">{formatRWF(receipt.total)}</p>
          <StatusPill status={receipt.paymentStatus} />

          <dl className="mt-6 divide-y divide-stone text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="text-right text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div aria-hidden className="relative my-6">
            <div className="border-t-2 border-dashed border-stone-dark" />
            <span className="absolute -left-10 -top-4 size-8 rounded-full bg-cream md:-left-12" />
            <span className="absolute -right-10 -top-4 size-8 rounded-full bg-cream md:-right-12" />
          </div>

          <dl className="space-y-2.5 text-[15px] tabular">
            <div className="flex justify-between"><dt className="text-ink-soft">Fare</dt><dd>{formatRWF(receipt.fare)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Platform fee</dt><dd>{formatRWF(receipt.platformFee)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatRWF(receipt.total)}</dd></div>
          </dl>
          <p className="mt-6 text-[12px] leading-snug text-ink-soft">
            Payment ref {receipt.paymentReference}.
          </p>
        </motion.article>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={share}>
            {copied ? <><Copy /> Copied</> : <><Share2 /> Share</>}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/app/history"><History /> History</Link>
          </Button>
        </div>
      </PageColumn>
      <ActionBar>
        <Button asChild size="xl" block>
          <Link href="/app"><Plus /> New journey</Link>
        </Button>
      </ActionBar>
    </>
  );
}

export function StatusPill({ status, className }: { status: Receipt["paymentStatus"]; className?: string }) {
  const map = {
    successful: "bg-success/10 text-success",
    cancelled: "bg-stone text-ink",
    failed: "bg-danger/10 text-danger",
  } as const;
  const label = { successful: "Paid", cancelled: "Cancelled", failed: "Failed" }[status];
  return <span className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium", map[status], className)}>{label}</span>;
}
