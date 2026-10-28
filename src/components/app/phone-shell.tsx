"use client";

import { cn } from "@/lib/utils";
import { useIsStandaloneApp } from "@/hooks/use-phone-app";

/** Keeps the passenger UI in a phone-app frame — never a full marketing website layout. */
export function PhoneShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const standalone = useIsStandaloneApp();

  return (
    <div
      className={cn(
        "mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-cream",
        standalone && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
