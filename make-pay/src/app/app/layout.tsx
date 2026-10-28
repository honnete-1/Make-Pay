import type { Metadata } from "next";
import { DemoBanner, TabBar } from "@/components/app/app-chrome";
import { LanguageSync } from "@/i18n";

export const metadata: Metadata = { title: { absolute: "Mâke pay" } };

/**
 * App shell: full screen on phones; on larger screens a phone-width column so
 * the layout is the one passengers actually get. The transform makes the
 * column the containing block for fixed bottom sheets.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone md:py-6">
      <LanguageSync />
      <div className="relative mx-auto flex h-dvh w-full max-w-[480px] transform-gpu flex-col overflow-hidden bg-cream md:h-[calc(100dvh-3rem)] md:rounded-[36px] md:shadow-phone md:ring-1 md:ring-forest/10">
        <DemoBanner />
        <main id="main" className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        <TabBar />
      </div>
    </div>
  );
}
