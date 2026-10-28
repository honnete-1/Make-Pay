"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { en, type Dictionary } from "./en";
import { rw } from "./rw";

export type Lang = "en" | "rw";
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "rw", label: "Ikinyarwanda", short: "RW" },
];

const DICTS: Record<Lang, Dictionary> = { en, rw };

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/**
 * Language preference, persisted separately from trip data so switching
 * language can never disturb an active journey. Rehydration is deferred to
 * <LanguageSync /> so the server and first client render agree (English).
 */
export const useLangStore = create<LangState>()(
  persist((set) => ({ lang: "en", setLang: (lang) => set({ lang }) }), {
    name: "make-pay-lang",
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
  }),
);

export function useT(): Dictionary {
  return DICTS[useLangStore((s) => s.lang)];
}

export function useLang() {
  // Two selectors: returning a fresh tuple from one selector re-renders forever in zustand v5.
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return [lang, setLang] as const;
}

/** Restores the saved language and keeps <html lang> in sync. Mount once. */
export function LanguageSync() {
  const lang = useLangStore((s) => s.lang);
  useEffect(() => {
    void useLangStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    // "rw" is the ISO 639-1 code for Kinyarwanda.
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

export type { Dictionary };
