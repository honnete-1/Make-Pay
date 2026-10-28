"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { TryMakePayButton } from "@/components/pwa/try-make-pay-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#problem", label: "Why it matters" },
  { href: "#how", label: "How it works" },
  { href: "#explorer", label: "Route explorer" },
  { href: "#transparency", label: "Transparency" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = true; // Always ensure readable navigation over every carousel slide.

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        "bg-cream/95 shadow-[0_1px_0_rgb(18_61_53/0.1)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" aria-label="Mâke pay home" className="rounded-xl">
          <Logo tone={solid ? "dark" : "light"} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-4 py-2 text-[14px] transition-colors",
                solid ? "text-ink hover:bg-forest/6" : "text-cream/85 hover:bg-white/10 hover:text-cream",
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <TryMakePayButton variant={solid ? "primary" : "lime"} size="sm" className="hidden sm:inline-flex">
            Try Mâke pay <ArrowUpRight />
          </TryMakePayButton>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn("grid size-11 place-items-center rounded-full lg:hidden", solid ? "text-forest hover:bg-forest/6" : "text-cream hover:bg-white/10")}
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
            className="h-[calc(100dvh-4.5rem)] bg-cream px-5 pb-10 pt-6 lg:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="block border-b border-forest/10 py-4 font-display text-3xl text-forest">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <TryMakePayButton size="lg" block className="mt-8">
              Try Mâke pay <ArrowUpRight />
            </TryMakePayButton>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
