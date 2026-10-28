"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MEDIA, type Photo } from "@/lib/media";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;

/** One photograph, one headline, one action. Line two is the serif accent. */
const SLIDES: { id: string; lines: [string, string]; photo: Photo }[] = [
  { id: "prices", lines: ["Same destination.", "Different prices."], photo: MEDIA.heroPrices },
  { id: "km", lines: ["Every kilometre", "counts."], photo: MEDIA.heroKilometres },
  { id: "pay", lines: ["Ride. Arrive.", "Pay."], photo: MEDIA.heroArrive },
];

export function HeroCarousel() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const slide = SLIDES[index]!;

  const go = useCallback((next: number, d?: number) => {
    setState(([cur]) => {
      const n = (next + SLIDES.length) % SLIDES.length;
      return [n, d ?? (n > cur ? 1 : -1)];
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea")) return;
      if (e.key === "ArrowRight") go(index + 1, 1);
      if (e.key === "ArrowLeft") go(index - 1, -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1, 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1, -1);
  };

  const autoplay = !reduce && !paused;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Mâke pay introduction"
      className="bg-cream px-2 pb-2 pt-16 md:px-4 md:pb-4 md:pt-[72px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="on-dark relative isolate h-[calc(100svh-4.5rem)] min-h-[560px] overflow-hidden rounded-[22px] bg-forest-900 md:h-[calc(100svh-5.5rem)] md:rounded-[32px]">
        {/* Photography */}
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slide.id}
            className="absolute inset-0 -z-10"
            initial={reduce ? { opacity: 0 } : { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)" }}
            exit={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduce ? 1 : 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: "linear" }}
            >
              <Image
                src={slide.photo.src}
                alt={slide.photo.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: slide.photo.focus }}
              />
            </motion.div>
            {/* Legibility: a soft floor of shade where the type sits, nothing over the subject. */}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_38_32/0)_35%,rgb(14_38_32/0.35)_65%,rgb(14_38_32/0.82)_100%)]" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgb(14_38_32/0.45),transparent_60%)]" />
          </motion.div>
        </AnimatePresence>

        {/* Swipe surface */}
        <motion.div
          className="absolute inset-0 z-0 cursor-grab touch-pan-y active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
          aria-hidden
        />

        {/* Photo credit */}
        <AnimatePresence mode="wait">
          <motion.p
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8 } }}
            exit={{ opacity: 0 }}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/25 px-3 py-1 text-[11px] text-cream/80 backdrop-blur-md md:right-6 md:top-6"
          >
            Photo · {slide.photo.credit.author} · {slide.photo.credit.place}
          </motion.p>
        </AnimatePresence>

        {/* Headline + single action */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-24 md:px-12 md:pb-14">
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id}
              aria-live="polite"
              className="max-w-[14ch] font-display text-[clamp(3rem,8.4vw,8rem)] font-medium leading-[0.9] tracking-[-0.045em] text-cream"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } }, exit: { transition: { staggerChildren: 0.03 } } }}
            >
              {slide.lines.map((t, i) => (
                <span key={t} className="block overflow-hidden pb-[0.1em]">
                  <motion.span variants={rise} className={cn("block", i === 1 && "font-accent text-[1.08em] leading-[0.85] text-lime")}>
                    {t}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>
          <div className="pointer-events-auto mt-7 md:mt-9">
            <Link
              href="/app"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-cream pl-7 pr-2 text-[16px] font-medium text-forest transition-colors hover:bg-white"
            >
              Check a fare
              <span className="grid size-10 place-items-center rounded-full bg-forest text-cream transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* Minimal controls */}
        <div className="absolute bottom-6 right-5 z-20 flex items-center gap-4 md:bottom-14 md:right-12">
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${s.lines.join(" ")}`}
                onClick={() => go(i)}
                className={cn("relative h-[3px] overflow-hidden rounded-full bg-white/25 transition-[width] duration-500", i === index ? "w-14" : "w-6 hover:bg-white/45")}
              >
                <span
                  key={`${s.id}-${index}`}
                  className="absolute inset-0 origin-left rounded-full bg-cream"
                  style={{
                    transform: i < index ? "scaleX(1)" : "scaleX(0)",
                    animation: i === index ? `hero-progress ${SLIDE_MS}ms linear forwards` : undefined,
                    animationPlayState: autoplay ? "running" : "paused",
                    ...(i === index && reduce ? { animation: "none", transform: "scaleX(1)" } : {}),
                  }}
                  onAnimationEnd={() => i === index && go(index + 1, 1)}
                />
              </button>
            ))}
          </div>
          <div className="hidden gap-1.5 sm:flex">
            <button onClick={() => go(index - 1, -1)} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full border border-white/30 text-cream transition-colors hover:bg-white/15">
              <ArrowLeft className="size-4" />
            </button>
            <button onClick={() => go(index + 1, 1)} aria-label="Next slide" className="grid size-11 place-items-center rounded-full border border-white/30 text-cream transition-colors hover:bg-white/15">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes hero-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}

const rise = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: "-105%", transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } },
} as const;
