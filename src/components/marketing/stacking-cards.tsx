"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Clock, MapPin, Navigation, Search, ShieldCheck, Signal } from "lucide-react";
import { SchematicMap } from "@/components/trip/schematic-map";
import { PhoneFrame } from "./phone-frame";
import { ScreenMomo } from "./screens";
import { Eyebrow, Reveal } from "./reveal";
import { computeRoute } from "@/lib/mock-services/routing.mock";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { pointAlong } from "@/lib/geo";
import { formatRWF } from "@/lib/format";
import { cn } from "@/lib/utils";

const R = computeRoute("cbd", "kimironko");
const Q = quoteFare(R.distanceKm);
const TRACK = pointAlong(R.path, 0.62);

type CardDef = { n: string; title: string; body: string; points: string[]; theme: string; Visual: () => React.ReactElement };

const CARDS: CardDef[] = [
  {
    n: "01",
    title: "Estimate.",
    body: "Know before you ride.",
    points: ["Route distance shown upfront", "Tariff and rounding explained", "Recent places one tap away"],
    theme: "bg-stone text-forest",
    Visual: EstimateVisual,
  },
  {
    n: "02",
    title: "Track.",
    body: "Every kilometre, visible.",
    points: ["Running fare in real time", "Clear GPS status", "Extensions itemised"],
    theme: "bg-forest text-cream",
    Visual: TrackVisual,
  },
  {
    n: "03",
    title: "Pay.",
    body: "One clear payment.",
    points: ["Fare and fee on separate lines", "Never asks for a PIN", "Digital receipt for every trip"],
    theme: "bg-lime text-forest",
    Visual: PayVisual,
  },
];

export function StackingCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="how" className="relative bg-cream pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <Reveal><Eyebrow>How it works</Eyebrow></Reveal>
            <Reveal delay={0.05}>
              <h2 className="max-w-3xl font-display text-[clamp(2.5rem,5.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-forest">
                Three moments. Zero guesswork.
              </h2>
            </Reveal>
          </div>

        </div>
      </div>
      <div ref={ref} className="relative mx-auto max-w-[1400px] px-3 md:px-10">
        {CARDS.map((c, i) => (
          <StackCard key={c.n} card={c} index={i} total={CARDS.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

function StackCard({ card, index, total, progress }: { card: CardDef; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - index) * 0.045]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, index === total - 1 ? 0 : 0.18]);
  const dark = card.theme.includes("bg-forest");
  return (
    <div className="sticky top-0 flex h-[100svh] items-center justify-center" style={{ paddingTop: `calc(5.5rem + ${index * 22}px)` }}>
      <motion.article
        style={{ scale }}
        className={cn(
          "relative grid h-[min(78svh,700px)] w-full origin-top grid-rows-[auto_1fr] overflow-hidden rounded-[2rem] md:grid-cols-[1fr_1.15fr] md:grid-rows-1 md:rounded-[2.5rem]",
          card.theme,
        )}
      >
        <div className="relative z-10 flex flex-col p-7 md:p-12 lg:p-16">
          <div className="flex items-center gap-4">
            <span className={cn("font-display text-sm font-semibold tabular", dark ? "text-lime" : "text-forest/60")}>{card.n}</span>
            <span className={cn("h-px flex-1", dark ? "bg-cream/20" : "bg-forest/20")} />
          </div>
          <h3 className="mt-6 font-display text-[clamp(2.2rem,4.5vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.04em]">{card.title}</h3>
          <p className={cn("mt-5 max-w-md text-[16px] leading-relaxed md:text-lg", dark ? "text-cream/75" : "text-forest/75")}>{card.body}</p>
          <ul className="hidden">
            {card.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] font-medium">
                <ArrowRight aria-hidden className={cn("size-4", dark ? "text-lime" : "")} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-0 overflow-hidden">
          <card.Visual />
        </div>
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-20 bg-ink" />
      </motion.article>
    </div>
  );
}

function EstimateVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
      <div className="absolute inset-y-0 right-0 w-full opacity-70 md:w-[115%]">
        <SchematicMap path={R.path} originId="cbd" destinationId="kimironko" showLabels={false} animateDraw={false} />
      </div>
      <div className="relative w-full max-w-[380px] space-y-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-float">
          <Search className="size-4 text-forest" />
          <span className="text-[15px] text-ink">Kimironko Market</span>
          <span className="ml-auto rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold text-forest">Check fare</span>
        </div>
        <div className="rounded-3xl bg-forest p-6 text-cream shadow-float">
          <div className="flex items-center justify-between text-[12px] text-cream/60">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-lime" /> Downtown → Kimironko</span>
            <span>{R.distanceKm.toFixed(1)} km</span>
          </div>
          <p className="mt-5 font-display text-6xl font-semibold tracking-tight text-lime tabular">{formatRWF(Q.fare, false)}</p>
          <p className="text-sm text-cream/70">RWF estimated · ~{R.durationMin} min</p>
          <p className="mt-5 border-t border-white/10 pt-4 text-[12px] text-cream/60">400 base + {(R.distanceKm - 2).toFixed(1)} km × 160</p>
        </div>
      </div>
    </div>
  );
}

function TrackVisual() {
  const km = R.distanceKm * 0.62;
  return (
    <div className="absolute inset-0">
      <SchematicMap path={R.path} travelled={TRACK.travelled} position={TRACK.point} originId="cbd" destinationId="kimironko" tone="dark" fitToPath showLabels={false} animateDraw={false} />
      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-2 md:bottom-10 md:left-10 md:right-10">
        {[
          { l: "Running fare", v: formatRWF(quoteFare(km).fare), icon: null, hi: true },
          { l: "Travelled", v: `${km.toFixed(1)} km`, icon: Navigation },
          { l: "Elapsed", v: "13:22", icon: Clock },
        ].map((s) => (
          <div key={s.l} className={cn("rounded-2xl p-3 backdrop-blur-xl md:p-4", s.hi ? "bg-lime text-forest" : "bg-forest-900/70 text-cream")}>
            <p className={cn("flex items-center gap-1 text-[11px]", s.hi ? "text-forest/70" : "text-cream/60")}>
              {s.icon && <s.icon className="size-3" />} {s.l}
            </p>
            <p className="mt-1 font-display text-lg font-semibold tabular md:text-2xl">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-forest-900/70 px-3 py-1.5 text-[12px] text-cream backdrop-blur md:left-10 md:top-10">
        <Signal className="size-3.5 text-lime" /> GPS · strong
      </div>
    </div>
  );
}

function PayVisual() {
  return (
    <div className="absolute inset-0">
      {/* Mobile: compact payment card */}
      <div className="flex h-full items-center justify-center p-6 md:hidden">
        <div className="w-full max-w-[340px] rounded-3xl bg-white p-5 shadow-float">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">MoMo checkout</p>
          <div className="mt-3 rounded-2xl border border-forest/20 px-4 py-2.5">
            <p className="text-[10px] text-ink-soft">Rider&apos;s MoMo number</p>
            <p className="text-[15px] tracking-wide text-ink tabular">078 812 3456</p>
          </div>
          <dl className="mt-3 space-y-1.5 text-[13px] tabular">
            <div className="flex justify-between"><dt className="text-ink-soft">Fare</dt><dd>{formatRWF(Q.fare)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Platform fee</dt><dd>{formatRWF(Q.platformFee)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatRWF(Q.total)}</dd></div>
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-forest"><ShieldCheck className="size-3.5" /> No PIN, ever</p>
        </div>
      </div>
      {/* Desktop: phone mockup */}
      <div className="hidden h-full items-end justify-center md:flex">
        <div className="relative translate-y-[14%]">
          <PhoneFrame>
            <ScreenMomo />
          </PhoneFrame>
          <div className="absolute -left-24 top-24 hidden w-56 rotate-[-4deg] rounded-2xl bg-white p-4 shadow-float lg:block">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-forest"><ShieldCheck className="size-4" /> No PIN, ever</p>
            <p className="mt-1 text-[12px] leading-snug text-ink-soft">You approve the request on your own phone’s MoMo prompt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
