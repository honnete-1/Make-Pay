"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function InstallDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { canPrompt, ios, installed, promptInstall } = usePwaInstall();

  const goInstallPage = () => {
    onOpenChange(false);
    router.push("/app/install");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[60] rounded-t-[var(--radius-sheet)] bg-cream p-5 safe-bottom md:inset-auto md:left-1/2 md:top-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-sheet)] md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Image src="/icons/icon-192.png" alt="" width={56} height={56} className="size-14 rounded-[14px] shadow-float" />
              <div>
                <Dialog.Title className="font-display text-2xl font-semibold text-forest">Download Mâke pay</Dialog.Title>
                <Dialog.Description className="mt-1 text-[14px] text-ink-soft">
                  Install the app on your phone. It opens the passenger app — not this website.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-full bg-stone text-forest" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="mt-6 space-y-3">
            {installed ? (
              <>
                <p className="rounded-2xl bg-lime/40 px-4 py-3 text-[15px] text-forest">
                  Mâke pay is installed. Open it from your home screen.
                </p>
                <Button size="xl" block onClick={() => { onOpenChange(false); router.push("/app"); }}>
                  Open the app
                </Button>
              </>
            ) : canPrompt ? (
              <Button
                size="xl"
                block
                onClick={async () => {
                  const ok = await promptInstall();
                  if (ok) {
                    onOpenChange(false);
                    router.push("/app");
                  }
                }}
              >
                <Download /> Install Mâke pay
              </Button>
            ) : (
              <Button size="xl" block onClick={goInstallPage}>
                <Download /> {ios ? "Continue on this phone" : "Show install steps"}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
