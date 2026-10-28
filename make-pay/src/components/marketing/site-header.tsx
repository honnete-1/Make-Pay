"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#problem", label: "Why" },
  { href: "#how", label: "How it works" },
  { href: "#explorer", label: "Fares" },
  { href: "#faq", label: "FAQ" },
];

/**
 * Always sits on solid ivory with dark-green text, so contrast never depends
 * on what is behind it. The hero photo is framed below the bar, not under it.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-cream/95 backdrop-blur-xl transition-shadow duration-300",
        scrolled && !open && "shadow-[0_1px_0_rgb(23_60_50/0.08)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/about" aria-label="Mâke pay home" className="rounded-xl">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative py-2 text-[15px] font-medium text-forest/80 transition-colors hover:text-forest"
            >
              {n.label}
              <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-forest transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden h-10 px-5 sm:inline-flex">
            <Link href="/app">
              Try Mâke pay <ArrowUpRight />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full text-forest hover:bg-forest/6 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex h-[calc(100dvh-4rem)] flex-col bg-cream px-5 pb-10 pt-6 lg:hidden"
          >
            <ul>
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-forest/10 py-5 font-display text-4xl font-medium tracking-tight text-forest">
                    <span className="font-sans text-xs tabular text-forest/40">0{i + 1}</span>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <Button asChild size="lg" block className="mt-auto">
              <Link href="/app">Try Mâke pay <ArrowUpRight /></Link>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
