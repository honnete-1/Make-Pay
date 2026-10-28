"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow, Reveal } from "./reveal";

export function ProblemSection(){
 return <section id="problem" className="bg-cream py-24 md:py-36">
  <div className="mx-auto max-w-[1300px] px-6 md:px-12">
   <Reveal><Eyebrow>The question worth asking</Eyebrow></Reveal>
   <div className="mt-5 grid items-end gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
    <div>
     <Reveal><h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-semibold leading-[.98] tracking-[-.05em] text-forest">How much <em className="font-medium">should</em> this ride cost?</h2></Reveal>
     <Reveal delay={0.1}><p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">Your destination is clear. Your fare should be too.</p></Reveal>
     <Reveal delay={0.15}><Link href="/app" className="mt-8 inline-flex items-center gap-2 border-b border-forest pb-2 text-sm font-semibold text-forest hover:gap-4 transition-all">See how Mâke pay works <ArrowUpRight className="size-4"/></Link></Reveal>
    </div>
    <Reveal delay={0.12}>
     <div className="overflow-hidden rounded-[2rem] bg-white shadow-float">
      <div className="px-7 pt-8 md:px-10 md:pt-10"><p className="text-xs font-semibold uppercase tracking-[.18em] text-forest/60">A simple comparison</p><h3 className="mt-2 font-display text-2xl font-semibold text-forest">Downtown → Remera</h3></div>
      <div className="grid grid-cols-2 gap-4 px-7 py-10 md:gap-10 md:px-10 md:py-14">
       <div><p className="mb-3 text-xs text-ink-soft">Driver quote</p><p className="font-display text-[clamp(2.3rem,5vw,5rem)] font-semibold leading-none tracking-tight text-ink">2,000</p><p className="mt-2 text-xs font-medium text-ink-soft">RWF</p></div>
       <div><p className="mb-3 text-xs text-ink-soft">Example estimate</p><p className="font-display text-[clamp(2.3rem,5vw,5rem)] font-semibold leading-none tracking-tight text-forest">1,500</p><p className="mt-2 text-xs font-medium text-ink-soft">RWF</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#E6EFD8] px-7 py-5 md:px-10"><span className="font-display text-xl font-semibold text-forest">Know before you go.</span><span className="max-w-xs text-[11px] leading-snug text-forest/75">Illustrative figures only — not official tariffs or guaranteed savings.</span></div>
     </div>
    </Reveal>
   </div>
  </div>
 </section>;
}
