import Image from "next/image";
import { Bike, Eye, MapPinned, Receipt, ShieldCheck, Smartphone, TrendingUp, Users } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { Eyebrow, Reveal } from "./reveal";

const PASSENGERS = [
  { icon: Eye, title: "See it before you ride", body: "A route and fare estimate before you sit down — no bargaining from a blank page." },
  { icon: MapPinned, title: "Follow every kilometre", body: "Live distance and running fare, with destination changes recorded as you go." },
  { icon: ShieldCheck, title: "Pay safely", body: "MoMo confirmation on your own phone. Mâke pay never asks for your PIN." },
  { icon: Receipt, title: "Keep a record", body: "Every trip saved with route, distance, fare and payment status." },
];
const RIDERS = [
  { icon: Users, title: "Fewer disputes", body: "A shared reference number makes conversations at the kerb shorter and friendlier." },
  { icon: Smartphone, title: "Paid to your MoMo", body: "Passengers pay directly to the rider’s number — no hunting for change." },
  { icon: TrendingUp, title: "Fair for long rides", body: "Extra distance and extensions are counted, not argued over." },
  { icon: Bike, title: "Built for the stage", body: "Fast, legible screens for bright sunlight, gloves and affordable phones." },
];

export function WhySection() {
  return (
    <section className="on-dark relative overflow-hidden bg-forest py-24 text-cream md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal><Eyebrow tone="light">Why Mâke pay</Eyebrow></Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-[clamp(2.5rem,5.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
                Clarity is a courtesy — to <span className="text-lime">both</span> sides of the ride.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="relative mt-10 aspect-[4/5] max-w-[460px] overflow-hidden rounded-[var(--radius-card)]">
              <Image src={MEDIA.editorial.src} alt={MEDIA.editorial.alt} fill unoptimized sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-forest-900/70 p-5 backdrop-blur-xl">
                <p className="font-display text-xl leading-snug">
                  “The best fare is the one nobody has to argue about.”
                </p>
                <p className="mt-2 text-[13px] text-cream/60">The Mâke pay principle</p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-16">
            <Group title="For passengers" items={PASSENGERS} />
            <Group title="For motorcycle-taxi riders" items={RIDERS} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ title, items }: { title: string; items: typeof PASSENGERS }) {
  return (
    <div>
      <Reveal>
        <h3 className="flex items-center gap-4 border-b border-cream/15 pb-5 font-display text-2xl font-semibold md:text-3xl">
          {title}
        </h3>
      </Reveal>
      <ul className="grid sm:grid-cols-2">
        {items.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 0.05} className="border-b border-cream/10 py-8 sm:odd:pr-8 sm:even:border-l sm:even:pl-8">
            <it.icon aria-hidden className="size-6 text-lime" strokeWidth={1.6} />
            <p className="mt-5 font-display text-xl font-semibold">{it.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{it.body}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
