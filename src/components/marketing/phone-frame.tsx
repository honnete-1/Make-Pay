import { cn } from "@/lib/utils";

/** A realistic, CSS-only smartphone shell. Content renders at 300×640. */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[320/660] w-[300px] rounded-[48px] bg-[#0c0f0f] p-[10px] shadow-phone ring-1 ring-white/10",
        className,
      )}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute -left-[3px] top-[120px] h-12 w-[3px] rounded-l bg-[#1b2020]" />
      <span aria-hidden className="absolute -left-[3px] top-[180px] h-16 w-[3px] rounded-l bg-[#1b2020]" />
      <span aria-hidden className="absolute -right-[3px] top-[150px] h-20 w-[3px] rounded-r bg-[#1b2020]" />
      <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-cream">
        {/* status bar */}
        <div aria-hidden className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between px-6 text-[11px] font-semibold text-ink">
          <span className="tabular">9:41</span>
          <span className="absolute left-1/2 top-2 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-[#0c0f0f]" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-[10px] w-[20px] rounded-[3px] border border-ink/70 p-[1px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-ink" />
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
