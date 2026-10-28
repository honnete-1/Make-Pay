"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { InstallDialog } from "./install-dialog";
import { StandaloneRedirect } from "./standalone-redirect";

interface InstallContextValue {
  openInstall: () => void;
  closeInstall: () => void;
}

const InstallContext = createContext<InstallContextValue | null>(null);

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openInstall = useCallback(() => setOpen(true), []);
  const closeInstall = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openInstall, closeInstall }), [openInstall, closeInstall]);

  return (
    <InstallContext.Provider value={value}>
      <StandaloneRedirect />
      {children}
      <InstallDialog open={open} onOpenChange={setOpen} />
    </InstallContext.Provider>
  );
}

export function useInstallDialog() {
  const ctx = useContext(InstallContext);
  if (!ctx) throw new Error("useInstallDialog must be used within InstallProvider");
  return ctx;
}
