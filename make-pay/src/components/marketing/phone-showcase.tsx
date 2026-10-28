"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { PhoneFrame } from "./phone-frame";
import { ScreenFare, ScreenMomo, ScreenPaid, ScreenRoute, ScreenSearch, ScreenTracking } from "./screens";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Choose", body: "Where to?", Screen: ScreenSearch },
  { title: "Preview", body: "The route, before you commit.", Screen: ScreenRoute },
  { title: "Estimate", body: "A fare you can see.", Screen: ScreenFare },
  { title: "Track", body: "Kilometres and fare, together.", Screen: () => <ScreenTracking /> },
  { title: "Pay", body: "Your rider's MoMo number.", Screen: ScreenMomo },
  { title: "Done", body: "One total. One receipt.", Screen: ScreenPaid },
];

export function PhoneShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length * 0.999));
    setStep((prev) => (prev === s ? prev : s));
  });
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 3]);
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const Active = STEPS[step]!.Screen;

  return (
    <section ref={ref} aria-label="The app, step by step" className="relative bg-stone text-forest" style={{ height: `${STEPS.length * 70 + 40}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* ambient rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-forest/8 md:left-[68%]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-forest/10 md:left-[68%]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/40 blur-3xl md:left-[68%]" />

        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-6 px-5 md:grid-cols-[1fr_1fr] md:px-10">
          <div className="order-2 md:order-1">
            <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-600">
              <span className="tabular">0{step + 1}</span> <span className="text-forest/35">/ 0{STEPS.length}</span>
            </p>
            <div className="relative mt-3 h-[clamp(3.6rem,10vw,9.5rem)] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={step}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[clamp(3.4rem,9.5vw,9rem)] font-medium leading-none tracking-[-0.055em]"
                >
                  {STEPS[step]!.title}
                </motion.h2>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-2 font-accent text-[clamp(1.5rem,2.4vw,2.2rem)] text-forest/75"
              >
                {STEPS[step]!.body}
              </motion.p>
            </AnimatePresence>
            <ol aria-label="Steps" className="mt-8 flex max-w-md gap-1.5 md:mt-12">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex-1">
                  <span className={cn("block h-[3px] rounded-full transition-colors duration-500", i <= step ? "bg-forest" : "bg-forest/15")} />
                  <span className={cn("mt-2 hidden text-[12px] transition-colors md:block", i === step ? "text-forest" : "text-forest/40")}>{s.title}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <motion.div style={{ rotate, y }} className="origin-center">
              <PhoneFrame className="scale-[0.78] sm:scale-90 md:scale-100">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={step}
                    className="absolute inset-0"
                    initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Active />
                  </motion.div>
                </AnimatePresence>
              </PhoneFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
