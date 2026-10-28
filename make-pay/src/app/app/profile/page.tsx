"use client";

import Link from "next/link";
import { Check, ExternalLink, Map as MapIcon } from "lucide-react";
import { AppHeader, PageColumn } from "@/components/app/app-chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LANGS, useLang, useT } from "@/i18n";
import { GOOGLE_ENABLED } from "@/lib/maps/config";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const t = useT();
  const [lang, setLang] = useLang();

  return (
    <>
      <AppHeader title={t.profile.title} right={<span />} />
      <PageColumn className="space-y-8">
        <section aria-labelledby="lang-h">
          <h2 id="lang-h" className="px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.profile.language}</h2>
          <div role="radiogroup" aria-labelledby="lang-h" className="mt-3 space-y-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                role="radio"
                aria-checked={lang === l.code}
                lang={l.code}
                onClick={() => setLang(l.code)}
                className={cn("flex min-h-16 w-full items-center gap-4 rounded-[20px] px-4 text-left transition-colors", lang === l.code ? "bg-forest text-cream" : "bg-white text-ink hover:bg-white/70")}
              >
                <span className={cn("grid size-10 place-items-center rounded-full text-[13px] font-bold", lang === l.code ? "bg-lime text-forest" : "bg-stone text-forest")}>{l.short}</span>
                <span className="flex-1 text-[17px] font-medium">{l.label}</span>
                {lang === l.code && <Check className="size-5 text-lime" />}
              </button>
            ))}
          </div>
          <p className="mt-2 px-1 text-[13px] text-ink-soft">{t.profile.languageHint}</p>
        </section>

        <section aria-labelledby="map-h">
          <h2 id="map-h" className="px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.profile.mapProvider}</h2>
          <p className="mt-3 flex items-center gap-3 rounded-[20px] bg-white px-4 py-4 text-[15px] text-ink">
            <MapIcon className="size-5 text-forest" />
            {GOOGLE_ENABLED ? t.profile.mapGoogle : t.profile.mapDemo}
          </p>
        </section>

        <section aria-labelledby="help-h">
          <h2 id="help-h" className="px-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">{t.profile.help}</h2>
          <Accordion type="single" collapsible className="mt-2 rounded-[20px] bg-white px-4">
            {t.profile.helpItems.map((h, i) => (
              <AccordionItem key={i} value={`h${i}`} className="last:border-0">
                <AccordionTrigger className="py-4 font-sans text-[16px] font-medium md:text-[16px]">{h.q}</AccordionTrigger>
                <AccordionContent className="pb-4 text-[15px]">{h.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section aria-labelledby="about-h" className="rounded-[20px] bg-stone/70 p-5">
          <h2 id="about-h" className="font-display text-xl font-semibold text-forest">{t.profile.about}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{t.profile.aboutBody}</p>
          <Link href="/about" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-forest underline underline-offset-4">
            {t.profile.website} <ExternalLink className="size-4" />
          </Link>
        </section>
      </PageColumn>
    </>
  );
}
