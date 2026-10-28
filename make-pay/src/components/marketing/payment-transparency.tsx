"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { DemoTag } from "@/components/ui/demo-tag";
import { Eyebrow, Reveal } from "./reveal";
import { formatRWF } from "@/lib/format";

const LINES = [
  { label: "Rider fare", sub: "Downtown → Kimironko · 8.9 km", value: 1500 },
  { label: "Proposed platform fee", sub: "Flat, per completed trip", value: 20 },
];
const TOTAL = 1520;

function CountUp({ to, start, delay = 0 }: { to: number; start: boolean; delay?: number }) {
  const [v, setV] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduce) { setV(to); return; }
    const c = animate(0, to, { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [start, to, delay, reduce]);
  return <span className="tabular">{formatRWF(v)}</span>;
}

export function PaymentTransparency() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section id="transparency" className="bg-stone py-24 md:py-40">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal><Eyebrow>Payment transparency</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.6rem,5.6vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.045em] text-forest">
              Every franc on <span className="font-accent text-[1.06em]">its own line.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
              Fare and fee are never blended — and you approve on your own phone.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative">
                    <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="relative mx-auto max-w-[480px] rounded-[2rem] bg-white p-7 shadow-float md:p-10"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-forest">Payment breakdown</p>
              <DemoTag>Illustrative scenario</DemoTag>
            </div>
            <div className="mt-8 space-y-6">
              {LINES.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.25, duration: 0.6 }}
                  className="flex items-baseline justify-between gap-4"
                >
                  <div>
                    <p className="text-[16px] font-medium text-ink">{l.label}</p>
                    <p className="text-[13px] text-ink-soft">{l.sub}</p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink">
                    <CountUp to={l.value} start={inView} delay={0.3 + i * 0.25} />
                  </p>
                </motion.div>
              ))}
            </div>
            {/* perforation */}
            <div aria-hidden className="relative my-8">
              <div className="border-t-2 border-dashed border-stone-dark" />
              <span className="absolute -left-11 -top-4 size-8 rounded-full bg-stone md:-left-14" />
              <span className="absolute -right-11 -top-4 size-8 rounded-full bg-stone md:-right-14" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="flex items-end justify-between"
            >
              <p className="text-[15px] font-medium text-ink-soft">Total you confirm</p>
              <p className="font-display text-5xl font-semibold tracking-tight text-forest">
                <CountUp to={TOTAL} start={inView} delay={0.9} />
              </p>
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex origin-left items-center gap-3 rounded-2xl bg-forest px-5 py-4 text-cream"
            >
              <ShieldCheck className="size-5 shrink-0 text-lime" />
              <p className="text-[14px]">Approved on your phone. Mâke pay never sees your PIN.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
