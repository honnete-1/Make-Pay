"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { PhoneFrame } from "./phone-frame";
import { ScreenFare, ScreenPaid, ScreenRoute, ScreenSearch, ScreenTracking } from "./screens";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Search your destination", body: "Type a neighbourhood or landmark — Kimironko, KCC, Nyabugogo. Recent places stay one tap away.", Screen: ScreenSearch },
  { title: "Preview the route", body: "See the recommended route, its distance and riding time before you commit.", Screen: ScreenRoute },
  { title: "Know the fare", body: "The estimate is broken down line by line: base fare, distance charge and rounding.", Screen: ScreenFare },
  { title: "Track the journey", body: "Distance, time and the running fare update together as the ride progresses.", Screen: () => <ScreenTracking /> },
  { title: "Confirm payment", body: "Pay the rider by MoMo. Fare and platform fee are listed separately on your receipt.", Screen: ScreenPaid },
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
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const Active = STEPS[step]!.Screen;

  return (
    <section ref={ref} aria-label="The app, step by step" className="relative bg-forest-900 text-cream" style={{ height: `${STEPS.length * 90 + 40}svh` }}>
      <div className="on-dark sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* ambient rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 md:left-[68%]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 md:left-[68%]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl md:left-[68%]" />

        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-6 px-5 md:grid-cols-[1fr_1fr] md:px-10">
          <div className="order-2 md:order-1">
            <p className="mb-4 hidden text-[13px] font-medium uppercase tracking-[0.16em] text-lime md:block">The app, step by step</p>
            <h2 className="hidden font-display text-[clamp(2.5rem,4.5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] md:block">
              From “how much?” to “paid” in five screens.
            </h2>
            <ol className="mt-4 space-y-1 md:mt-12">
              {STEPS.map((s, i) => (
                <li key={s.title} className={cn("transition-opacity duration-500", i === step ? "opacity-100" : "hidden opacity-35 md:block")}>
                  <div className="flex gap-5 py-3">
                    <span className={cn("font-display text-sm tabular transition-colors", i === step ? "text-lime" : "text-cream/50")}>0{i + 1}</span>
                    <div>
                      <p className="font-display text-xl font-semibold md:text-2xl">{s.title}</p>
                      <AnimatePresence initial={false}>
                        {i === step && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="max-w-md overflow-hidden text-[15px] leading-relaxed text-cream/70 md:text-base"
                          >
                            <span className="block pt-2">{s.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 h-[2px] w-full max-w-md overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-lime" style={{ width: bar }} />
            </div>
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
