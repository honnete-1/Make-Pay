import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MEDIA } from "@/lib/media";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  const photos = Object.values(MEDIA);
  return (
    <main id="main" className="mx-auto max-w-[1100px] px-5 py-16 md:px-8 md:py-24">
      <Link href="/about" className="inline-flex items-center gap-2 text-[15px] text-forest/75 hover:text-forest">
        <ArrowLeft className="size-4" /> Back to Mâke pay
      </Link>
      <h1 className="mt-8 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.045em] text-forest">
        Photo <span className="font-accent text-[1.06em]">credits</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg text-ink-soft">
        Real photographs from Wikimedia Commons, used under their Creative Commons licences. Each was resized and compressed
        for the web; crops are applied in the browser. No other changes were made.
      </p>
      <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {photos.map((p) => (
          <li key={p.src}>
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-stone">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" style={{ objectPosition: p.focus }} />
            </div>
            <p className="mt-4 text-[15px] text-ink">{p.alt}</p>
            <p className="mt-1 text-[14px] text-ink-soft">
              {p.credit.author} · {p.credit.place} ·{" "}
              <a href={p.credit.licenseUrl} className="underline underline-offset-4 hover:text-forest" rel="license noopener" target="_blank">
                {p.credit.license}
              </a>{" "}
              ·{" "}
              <a href={p.credit.source} className="underline underline-offset-4 hover:text-forest" rel="noopener" target="_blank">
                Source
              </a>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
