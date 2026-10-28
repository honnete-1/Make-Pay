import type { Metadata } from "next";
import { DemoBanner } from "@/components/app/app-chrome";
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
        <main id="main" className="relative flex flex-1 flex-col">
          {children}
        </main>
      </PhoneShell>
    </RequireInstall>
  );
}
