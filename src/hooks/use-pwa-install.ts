"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((l) => l());
}

function getDeferred() {
  return deferred;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches;
  const ios = "standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Browser may use the passenger app without installing (local development only). */
export function allowBrowserApp(): boolean {
  return process.env.NODE_ENV === "development";
}

export function usePwaInstall() {
  const promptEvent = useSyncExternalStore(subscribe, getDeferred, () => null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isInstalledPwa());
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setInstalled(isInstalledPwa());
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const canPrompt = !!promptEvent && !installed;
  const ios = isIosDevice();

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emit();
    if (outcome === "accepted") setInstalled(true);
    return outcome === "accepted";
  }, []);

  return { installed, canPrompt, ios, promptInstall };
}
