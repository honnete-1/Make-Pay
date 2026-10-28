"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Logo } from "@/components/brand/logo";
import { TryMakePayButton } from "@/components/pwa/try-make-pay-button";
import { Eyebrow, Reveal } from "./reveal";

const FAQS = [
  {
    q: "Is Mâke pay available today?",
    a: "Yes. Download Mâke pay to your phone, choose a destination in Kigali, and see the route and fare before you ride. You pay the rider with MTN MoMo when the journey ends.",
  },
  {
    q: "How is the fare estimated?",
    a: "The fare is calculated from the route distance: 400 RWF covers the first 2 km, then 160 RWF per additional kilometre, rounded to the nearest 50 RWF.",
  },
  {
    q: "Will Mâke pay ever ask for my MoMo PIN?",
    a: "Never. With mobile money, the payment request appears on the payer’s own phone and is approved there. If anything inside Mâke pay asks for your PIN, it is not us.",
  },
  {
    q: "What is the 20 RWF platform fee?",
    a: "A flat 20 RWF fee on each completed trip. It is always shown on its own line, separate from the rider’s fare, before you confirm.",
  },
  {
    q: "What if I change destination during the ride?",
    a: "Add the new destination in the app. The extra distance is added to the trip and itemised on the summary, so both passenger and rider can see where the difference comes from.",
  },
  {
    q: "Does it work on basic Android phones and slow connections?",
    a: "That is a design goal. Screens are lightweight, text is large and high-contrast, animation respects reduced-motion settings, and the map falls back to a simple schematic when tiles cannot load.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-cream py-24 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Reveal><Eyebrow>Questions</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-forest">
              Good questions, plain answers.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-forest/12">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="on-dark relative overflow-hidden bg-forest text-cream">
      <svg aria-hidden viewBox="0 0 1400 600" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <motion.path
          d="M -50 520 C 200 420, 340 560, 560 430 S 900 220, 1080 300 S 1300 160, 1460 120"
          fill="none"
          stroke="#D9F068"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          opacity={0.7}
        />
        <circle cx="1080" cy="300" r="10" fill="#D9F068" opacity="0.8" />
      </svg>
      <div className="relative mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-44">
        <Reveal>
          <h2 className="max-w-5xl font-display text-[clamp(3.2rem,10vw,9.5rem)] font-semibold leading-[0.88] tracking-[-0.05em]">
            Every ride deserves <span className="text-lime">clarity.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
          <TryMakePayButton variant="lime" size="xl">
            Download the app <ArrowUpRight />
          </TryMakePayButton>
          <p className="max-w-xs text-[15px] text-cream/70">Get the phone app — not a website tab. No sign-up.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-dark bg-forest-900 text-cream">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-[15px] text-cream/65">Know your route. Know your fare. Pay with confidence.</p>
        </div>
        <div className="text-[13px] text-cream/50 md:text-right">
          <p>Kigali, Rwanda.</p>
          <p className="mt-1">Map data © OpenStreetMap contributors (in-app map). © 2026 Mâke pay.</p>
        </div>
      </div>
    </footer>
  );
}
