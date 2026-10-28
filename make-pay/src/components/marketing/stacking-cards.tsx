"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Check, Search } from "lucide-react";
import { PhoneFrame } from "./phone-frame";
import { ScreenFare, ScreenMomo, ScreenTracking } from "./screens";
import { Eyebrow, Reveal } from "./reveal";
import { computeRoute } from "@/lib/mock-services/routing.mock";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { formatRWF } from "@/lib/format";
import { MEDIA } from "@/lib/media";
import { cn } from "@/lib/utils";

const Q = quoteFare(computeRoute("cbd", "kimironko").distanceKm);

type CardDef = { n: string; title: string; line: string; theme: "stone" | "photo" | "lime"; Visual: () => React.ReactElement };

const CARDS: CardDef[] = [
  { n: "01", title: "Estimate.", line: "Know before you ride.", theme: "stone", Visual: EstimateVisual },
  { n: "02", title: "Track.", line: "Every kilometre, visible.", theme: "photo", Visual: TrackVisual },
  { n: "03", title: "Pay.", line: "One clear payment.", theme: "lime", Visual: PayVisual },
];

export function StackingCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="how" className="relative bg-cream pb-24 pt-10 md:pb-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <Reveal><Eyebrow>How it works</Eyebrow></Reveal>
        <Reveal delay={0.05}>
          <h2 className="max-w-4xl font-display text-[clamp(2.6rem,5.6vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.045em] text-forest">
            Three moments. <span className="font-accent text-[1.06em]">Zero guesswork.</span>
          </h2>
        </Reveal>
      </div>
      <div ref={ref} className="relative mx-auto mt-6 max-w-[1440px] px-2 md:mt-10 md:px-8">
        {CARDS.map((c, i) => (
          <StackCard key={c.n} card={c} index={i} total={CARDS.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

const THEME = {
  stone: "bg-stone text-forest",
  photo: "bg-forest-900 text-cream",
  lime: "bg-lime text-forest",
} as const;

function StackCard({ card, index, total, progress }: { card: CardDef; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - index) * 0.04]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, index === total - 1 ? 0 : 0.22]);
  const dark = card.theme === "photo";
  // Alternate the composition: text left, right, left.
  const flip = index === 1;
  return (
    <div className="sticky top-0 flex h-[100svh] items-center justify-center" style={{ paddingTop: `calc(4.5rem + ${index * 18}px)` }}>
      <motion.article
        style={{ scale }}
        className={cn("relative h-[min(80svh,720px)] w-full origin-top overflow-hidden rounded-[24px] md:rounded-[36px]", THEME[card.theme])}
      >
        <card.Visual />
        <div className={cn("pointer-events-none relative z-10 flex h-full flex-col gap-5 p-7 md:justify-between md:gap-0 md:p-14", flip && "md:items-end md:text-right")}>
          <span className={cn("font-display text-sm font-medium tabular", dark ? "text-lime" : "text-forest/55")}>
            {card.n} / 03
          </span>
          <div className={cn("max-w-2xl", flip && "md:ml-auto")}>
            <h3 className="font-display text-[clamp(3.4rem,9vw,9rem)] font-medium leading-[0.85] tracking-[-0.055em]">{card.title}</h3>
            <p className={cn("mt-4 font-accent text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight", dark ? "text-cream/85" : "text-forest/80")}>{card.line}</p>
          </div>
        </div>
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-20 bg-ink" />
      </motion.article>
    </div>
  );
}

/** 01 — phone rising from the bottom edge, a search chip floating beside it. */
function EstimateVisual() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div aria-hidden className="absolute -right-24 top-1/2 size-[640px] -translate-y-1/2 rounded-full border border-forest/10 md:right-[4%]" />
      <div aria-hidden className="absolute -right-4 top-1/2 size-[420px] -translate-y-1/2 rounded-full border border-forest/10 md:right-[13%]" />
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-[38%] scale-[0.72] sm:translate-y-[30%] md:right-[16%] md:translate-x-0 md:translate-y-[22%] md:scale-100">
        <PhoneFrame>
          <ScreenFare />
        </PhoneFrame>
        <div className="absolute -left-44 -top-8 hidden items-center gap-3 rounded-2xl bg-white py-3 pl-4 pr-3 shadow-float lg:flex">
          <Search className="size-4 text-forest" />
          <span className="text-[14px] text-ink">Kimironko Market</span>
          <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold text-forest">{formatRWF(Q.fare)}</span>
        </div>
      </div>
    </div>
  );
}

/** 02 — real Kigali streets under a dark wash, phone held left of centre. */
function TrackVisual() {
  return (
    <div aria-hidden className="absolute inset-0">
      <Image src={MEDIA.aerial.src} alt="" fill sizes="(min-width: 768px) 90vw, 100vw" className="object-cover opacity-60" style={{ objectPosition: MEDIA.aerial.focus }} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(14_38_32/0.35)_0%,rgb(14_38_32/0.55)_50%,rgb(14_38_32/0.92)_100%)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[38%] scale-[0.72] sm:translate-y-[30%] md:left-[14%] md:translate-x-0 md:translate-y-[18%] md:rotate-[-4deg] md:scale-100">
        <PhoneFrame>
          <ScreenTracking progress={0.62} />
        </PhoneFrame>
      </div>
      <p className="absolute bottom-4 right-5 hidden text-[11px] text-cream/55 md:block">
        {MEDIA.aerial.credit.place} · Photo {MEDIA.aerial.credit.author}
      </p>
    </div>
  );
}

/** 03 — checkout phone plus the outcome: a single confirmed total. */
function PayVisual() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-[38%] scale-[0.72] sm:translate-y-[30%] md:right-[12%] md:translate-x-0 md:translate-y-[20%] md:rotate-[3deg] md:scale-100">
        <PhoneFrame>
          <ScreenMomo />
        </PhoneFrame>
        <div className="absolute -left-48 top-40 hidden w-60 -rotate-[4deg] items-center gap-3 rounded-[20px] bg-forest p-4 text-cream shadow-phone lg:flex">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime">
            <Check className="size-5 text-forest" strokeWidth={3} />
          </span>
          <span>
            <span className="block font-display text-xl font-medium tabular">{formatRWF(Q.total)}</span>
            <span className="block text-[12px] text-cream/65">Paid · demo</span>
          </span>
        </div>
      </div>
    </div>
  );
}
