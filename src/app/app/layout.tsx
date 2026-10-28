import type { Metadata } from "next";
import { DemoBanner } from "@/components/app/app-chrome";

export const metadata: Metadata = { title: "Passenger app" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <DemoBanner />
      <main id="main" className="relative flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
