"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Share, SquarePlus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { isInstalledPwa, usePwaInstall } from "@/hooks/use-pwa-install";

/** Install surface under /app so Add to Home Screen launches the passenger app. */
export default function InstallPage() {
  const router = useRouter();
  const { canPrompt, ios, promptInstall } = usePwaInstall();

  useEffect(() => {
    if (isInstalledPwa()) router.replace("/app");
  }, [router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10 safe-top safe-bottom">
      <Logo />
      <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="mt-10 size-[72px] rounded-[18px] shadow-float" />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-forest">Add Mâke pay to your home screen</h1>
      <p className="mt-3 text-[15px] text-ink-soft">
        Do this from this screen so the icon opens the passenger app — not the website.
      </p>

      <div className="mt-8">
        {canPrompt ? (
          <Button
            size="xl"
            block
            onClick={async () => {
              const ok = await promptInstall();
              if (ok) router.replace("/app");
            }}
          >
            <Download /> Install Mâke pay
          </Button>
        ) : ios ? (
          <ol className="space-y-3 rounded-[var(--radius-card)] bg-white p-5 text-[15px] text-ink shadow-float">
            <li className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stone text-forest"><Share className="size-4" /></span>
              <span>Tap <strong>Share</strong> in Safari.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stone text-forest"><SquarePlus className="size-4" /></span>
              <span>Choose <strong>Add to Home Screen</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime text-forest font-display text-sm font-semibold">3</span>
              <span>Tap <strong>Add</strong>, then open the new Mâke pay icon.</span>
            </li>
          </ol>
        ) : (
          <p className="rounded-[var(--radius-card)] bg-white p-5 text-[15px] text-ink-soft shadow-float">
            Open your browser menu and choose <strong className="text-ink">Install app</strong> or <strong className="text-ink">Add to Home screen</strong> while you stay on this page.
          </p>
        )}
      </div>
    </div>
  );
}
