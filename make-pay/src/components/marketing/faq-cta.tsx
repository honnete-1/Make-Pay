"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Eyebrow, Reveal } from "./reveal";
import { MEDIA } from "@/lib/media";

const FAQS = [
  {
    q: "Is Mâke pay available today?",
    a: "Not yet. This is an interactive product demonstration. Routes, GPS tracking, fares and payments are simulated in your browser using demonstration data — no real money moves and no location is read.",
  },
  {
    q: "How is the fare estimated?",
    a: "In this demo, the fare is calculated from the route distance using an illustrative tariff: 400 RWF covers the first 2 km, then 160 RWF per additional kilometre, rounded to the nearest 50 RWF. It is not an official or regulator-approved fare; a production version would use the approved schedule.",
  },
  {
    q: "Will Mâke pay ever ask for my MoMo PIN?",
    a: "Never. With mobile money, the payment request appears on the payer’s own phone and is approved there. If anything inside Mâke pay asks for your PIN, it is not us.",
  },
  {
    q: "What is the 20 RWF platform fee?",
    a: "It is a proposed flat fee per completed trip that would fund the service. It is always shown on its own line, separate from the rider’s fare, before you confirm.",
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
    <section id="faq" className="bg-cream py-24 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Reveal><Eyebrow>Questions</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.6rem,5vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-forest">
              Good questions, <span className="font-accent text-[1.06em]">plain answers.</span>
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
    <section className="bg-cream px-2 pb-2 md:px-4 md:pb-4">
      <div className="on-dark relative isolate overflow-hidden rounded-[22px] bg-forest-900 text-cream md:rounded-[32px]">
        <Image
          src={MEDIA.dusk.src}
          alt={MEDIA.dusk.alt}
          fill
          sizes="100vw"
          className="-z-10 object-cover"
          style={{ objectPosition: MEDIA.dusk.focus }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(14_38_32/0.15)_0%,rgb(14_38_32/0.75)_100%)]" />
        <div className="relative px-6 pb-12 pt-48 md:px-12 md:pb-16 md:pt-[32vh]">
          <Reveal>
            <h2 className="max-w-5xl font-display text-[clamp(3.2rem,9vw,8.5rem)] font-medium leading-[0.88] tracking-[-0.05em]">
              Every ride deserves <span className="font-accent text-[1.08em] text-lime">clarity.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="lime" size="xl">
              <Link href="/app">
                Try the app <ArrowUpRight />
              </Link>
            </Button>
            <p className="text-[12px] text-cream/70">Interactive demo · no sign-up · Photo {MEDIA.dusk.credit.author}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-dark bg-forest-900 text-cream">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-[15px] text-cream/65">Know your route. Know your fare. Pay with confidence.</p>
        </div>
        <div className="text-[13px] text-cream/50 md:text-right">
          <p>Product prototype for Kigali, Rwanda. All fares shown are illustrative.</p>
          <p className="mt-1">
            Map data © OpenStreetMap contributors (in-app map).{" "}
            <Link href="/credits" className="underline underline-offset-4 hover:text-cream">Photo credits</Link>. © 2026 Mâke pay.
          </p>
        </div>
      </div>
    </footer>
  );
}
