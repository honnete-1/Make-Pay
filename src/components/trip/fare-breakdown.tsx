import type { FareQuote, Tariff } from "@/types";
import { formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FareBreakdown({ quote, tariff, tone = "light", showFee = false }: { quote: FareQuote; tariff: Tariff; tone?: "light" | "dark"; showFee?: boolean }) {
  const dark = tone === "dark";
  const extra = Math.max(0, quote.distanceKm - tariff.includedKm);
  return (
    <dl className={cn("space-y-2 text-[14px] tabular", dark ? "text-cream/75" : "text-ink-soft")}>
      <Row k={`Base fare · first ${tariff.includedKm} km`} v={formatRWF(quote.baseFare)} />
      <Row k={`${extra.toFixed(1)} km × ${tariff.perKm} RWF`} v={formatRWF(quote.distanceCharge)} />
      <Row k={`Rounded to nearest ${tariff.roundTo}`} v={formatRWF(quote.fare)} strong dark={dark} />
      {showFee && (
        <>
          <Row k="Platform fee" v={formatRWF(quote.platformFee)} />
          <div className={cn("h-px", dark ? "bg-white/10" : "bg-stone-dark/70")} />
          <Row k="Total" v={formatRWF(quote.total)} strong dark={dark} />
        </>
      )}
    </dl>
  );
}

function Row({ k, v, strong, dark }: { k: string; v: string; strong?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{k}</dt>
      <dd className={cn(strong && "font-semibold", strong && (dark ? "text-cream" : "text-ink"))}>{v}</dd>
    </div>
  );
}
