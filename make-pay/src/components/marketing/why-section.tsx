import Image from "next/image";
import { MEDIA, type Photo } from "@/lib/media";
import { Eyebrow, Reveal } from "./reveal";

const SIDES: { who: string; photo: Photo; points: string[]; offset: string; ratio: string }[] = [
  {
    who: "For passengers",
    photo: MEDIA.street,
    points: ["See the fare first", "Follow every kilometre", "Pay without a PIN"],
    offset: "lg:mt-0",
    ratio: "aspect-[4/5]",
  },
  {
    who: "For riders",
    photo: MEDIA.rider,
    points: ["Fewer kerbside disputes", "Paid straight to MoMo", "Long rides counted fairly"],
    offset: "lg:mt-40",
    ratio: "aspect-[4/5] lg:aspect-[5/6]",
  },
];

export function WhySection() {
  return (
    <section className="bg-cream py-24 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal><Eyebrow>Why Mâke pay</Eyebrow></Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-[clamp(2.6rem,5.6vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.045em] text-forest">
                Clarity for <span className="font-accent text-[1.06em]">both</span> sides of the ride.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-8 lg:mt-20 lg:gap-24">
          {SIDES.map((s, i) => (
            <Reveal key={s.who} delay={i * 0.1} className={s.offset}>
              <figure>
                <div className={`relative overflow-hidden rounded-[24px] ${s.ratio}`}>
                  <Image
                    src={s.photo.src}
                    alt={s.photo.alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.6s] ease-out hover:scale-[1.03]"
                    style={{ objectPosition: s.photo.focus }}
                  />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/30 px-3 py-1 text-[11px] text-cream/85 backdrop-blur-md">
                    {s.photo.credit.place} · Photo {s.photo.credit.author}
                  </span>
                </div>
                <figcaption className="mt-7">
                  <p className="font-accent text-3xl text-forest md:text-4xl">{s.who}</p>
                  <ul className="mt-4 border-t border-forest/12">
                    {s.points.map((p, j) => (
                      <li key={p} className="flex items-baseline gap-5 border-b border-forest/12 py-4 font-display text-xl font-medium tracking-tight text-forest md:text-2xl">
                        <span className="font-sans text-xs font-normal tabular text-forest/40">0{j + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
