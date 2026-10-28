import type { Metadata } from "next";
import { DemoBanner, TabBar } from "@/components/app/app-chrome";
import { PhoneShell } from "@/components/app/phone-shell";
import { HydrateReceipts } from "@/components/app/hydrate-receipts";
import { RequireInstall } from "@/components/pwa/require-install";

export const metadata: Metadata = { title: "Mâke pay" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireInstall>
      <PhoneShell>
        <DemoBanner />
        <HydrateReceipts />
        <main id="main" className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        <TabBar />
      </PhoneShell>
    </RequireInstall>
  );
}
