"use client";

import type { FareQuote, Tariff } from "@/types";
import { formatRWF } from "@/lib/format";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export function FareBreakdown({ quote, tariff, tone = "light", showFee = false }: { quote: FareQuote; tariff: Tariff; tone?: "light" | "dark"; showFee?: boolean }) {
  const t = useT();
  const dark = tone === "dark";
  const extra = Math.max(0, quote.distanceKm - tariff.includedKm);
  return (
    <dl className={cn("space-y-2 text-[14px] tabular", dark ? "text-cream/75" : "text-ink-soft")}>
      <Row k={t.fare.base(tariff.includedKm)} v={formatRWF(quote.baseFare)} />
      <Row k={t.fare.perKm(extra.toFixed(1), tariff.perKm)} v={formatRWF(quote.distanceCharge)} />
      <Row k={t.fare.rounded(tariff.roundTo)} v={formatRWF(quote.fare)} strong dark={dark} />
      {showFee && (
        <>
          <Row k={t.fare.platformFee} v={formatRWF(quote.platformFee)} />
          <div className={cn("h-px", dark ? "bg-white/10" : "bg-stone-dark/70")} />
          <Row k={t.fare.total} v={formatRWF(quote.total)} strong dark={dark} />
        </>
      )}
    </dl>
  );
}

function Row({ k, v, strong, dark }: { k: string; v: string; strong?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{k}</dt>
      <dd className={cn("shrink-0", strong && "font-semibold", strong && (dark ? "text-cream" : "text-ink"))}>{v}</dd>
    </div>
  );
}
