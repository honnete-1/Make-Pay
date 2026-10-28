"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { useInstallDialog } from "@/components/pwa/install-context";

const SLIDES = [
  { id: "fair", headline: "Same destination.\nDifferent prices.", eyebrow: "A clearer way around Kigali", media: MEDIA.heroPrices },
  { id: "route", headline: "Every kilometre\ncounts.", eyebrow: "See your route before you ride", media: MEDIA.heroKilometres },
  { id: "momo", headline: "Ride. Arrive.\nPay.", eyebrow: "One journey. One clear total.", media: MEDIA.heroArrive },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const { openInstall } = useInstallDialog();
  const go = useCallback((n: number) => setIndex((n + SLIDES.length) % SLIDES.length), []);
  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 8500);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,button,a")) return;
      if (e.key === "ArrowRight") setIndex(i => (i+1)%SLIDES.length);
      if (e.key === "ArrowLeft") setIndex(i => (i-1+SLIDES.length)%SLIDES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const slide = SLIDES[index];
  return (
    <section aria-label="Introduction to Mâke pay" aria-roledescription="carousel"
      className="relative isolate min-h-[580px] h-[88svh] max-h-[980px] overflow-hidden bg-forest-900 pt-20 text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div key={slide.id} className="absolute inset-0 -z-10" initial={{opacity:0,scale:1.04}}
          animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:reduceMotion?0:0.9}}>
          <Image src={slide.media.src} alt={slide.media.alt} fill priority={index===0} sizes="100vw" className="object-cover" unoptimized />
        </motion.div>
      </AnimatePresence>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] bg-[linear-gradient(90deg,rgba(10,31,27,.84)_0%,rgba(10,31,27,.55)_44%,rgba(10,31,27,.12)_100%)]" />
      <motion.div className="absolute inset-0 z-0 touch-pan-y" drag="x" dragConstraints={{left:0,right:0}} dragElastic={0.12}
        onDragEnd={(_:unknown, info:PanInfo)=>{if(info.offset.x < -65) go(index+1); if(info.offset.x>65) go(index-1);}} aria-hidden />
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 pb-24 pt-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.5}}>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[.22em] text-[#D8EF93]">{slide.eyebrow}</p>
            <h1 className="max-w-[980px] whitespace-pre-line font-display text-[clamp(3.3rem,8vw,8rem)] font-semibold leading-[.97] tracking-[-.045em] text-white text-balance">{slide.headline}</h1>
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={openInstall}
          className="pointer-events-auto mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-[#D9F068] px-7 py-4 text-sm font-semibold text-[#123D35] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Download Mâke pay <ArrowUpRight className="size-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-6 pb-8 md:px-12 md:pb-10">
        <div className="flex items-center gap-3" aria-label="Carousel pages">
          {SLIDES.map((s,i)=><button key={s.id} type="button" onClick={()=>go(i)} aria-label={`Show slide ${i+1}`} aria-current={index===i ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${index===i ? "w-12 bg-[#D9F068]" : "w-6 bg-white/40 hover:bg-white/70"}`} />)}
        </div>
        <div className="flex items-center gap-3 text-white">
          <span className="mr-2 text-xs tracking-[.16em] text-white/75">0{index+1} / 0{SLIDES.length}</span>
          <button type="button" onClick={()=>go(index-1)} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full border border-white/40 hover:bg-white/15"><ArrowLeft className="size-4"/></button>
          <button type="button" onClick={()=>go(index+1)} aria-label="Next slide" className="grid size-11 place-items-center rounded-full border border-white/40 hover:bg-white/15"><ArrowRight className="size-4"/></button>
        </div>
      </div>
    </section>
  );
}
