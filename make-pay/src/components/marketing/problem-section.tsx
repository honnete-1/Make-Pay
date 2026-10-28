"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { DemoTag } from "@/components/ui/demo-tag";
import { Eyebrow, Reveal } from "./reveal";
import { computeRoute } from "@/lib/mock-services/routing.mock";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { formatRWF } from "@/lib/format";
import { MEDIA } from "@/lib/media";

const ROUTE = computeRoute("cbd", "kimironko");
const ESTIMATE = quoteFare(ROUTE.distanceKm).fare;
/** A hypothetical kerbside quote for the same trip — not survey data. */
const QUOTED = 2000;

function Count({ to, start }: { to: number; start: boolean }) {
  const [v, setV] = useState(to);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start || reduce) return;
    const c = animate(Math.round(to * 0.6), to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x / 10) * 10) });
    return () => c.stop();
  }, [start, to, reduce]);
  return <span className="tabular">{formatRWF(v, false)}</span>;
}

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });

  return (
    <section id="problem" className="relative bg-cream py-24 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-8">
        {/* Photograph: the stage, where the price is decided */}
        <Reveal className="relative lg:col-span-5 lg:row-span-2">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-[24px] lg:aspect-auto lg:h-[min(78vh,760px)]">
            <Image
              src={MEDIA.stage.src}
              alt={MEDIA.stage.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              style={{ objectPosition: MEDIA.stage.focus }}
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-black/30 px-3 py-1 text-[11px] text-cream/85 backdrop-blur-md">
              {MEDIA.stage.credit.place} · Photo {MEDIA.stage.credit.author}
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-8">
          <Reveal><Eyebrow>The problem</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.6rem,5.6vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.045em] text-forest">
              The price depends on <span className="font-accent text-[1.06em]">who you ask.</span>
            </h2>
          </Reveal>
        </div>

        {/* The comparison: readable in five seconds */}
        <div ref={ref} className="lg:col-span-6 lg:col-start-7 lg:self-end">
          <p className="mb-6 text-[15px] text-ink-soft">
            Downtown → Kimironko · {ROUTE.distanceKm.toFixed(1)} km
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 md:gap-8">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-terracotta-700">Quoted at the stage</p>
              <p className="relative mt-3 w-fit font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-none tracking-[-0.05em] text-ink/45">
                <Count to={QUOTED} start={inView} />
                <motion.span
                  aria-hidden
                  className="absolute left-[-4%] top-[52%] h-[0.07em] w-[108%] origin-left rounded-full bg-terracotta"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                />
              </p>
            </div>
            <span className="pb-3 font-accent text-3xl text-ink-soft md:pb-5 md:text-4xl">vs</span>
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-forest-600">Estimated by distance</p>
              <p className="mt-3 font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-none tracking-[-0.05em] text-forest">
                <Count to={ESTIMATE} start={inView} />
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-forest/12 pt-6">
            <DemoTag>Hypothetical example</DemoTag>
            <p className="text-[13px] text-ink-soft">Amounts in RWF. Not an official fare or a verified saving.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
