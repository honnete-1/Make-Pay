"use client";

import { GOOGLE_BROWSER_KEY } from "./config";

/* Minimal typing: the official @types/google.maps package is not installed. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GoogleNS = any;

declare global {
  interface Window {
    google?: GoogleNS;
    __makePayMapsReady?: () => void;
  }
}

let loading: Promise<GoogleNS> | null = null;

/**
 * Loads the Maps JavaScript API once, using Google's documented script tag
 * with `loading=async`. Rejects (and lets callers fall back) if there is no
 * key, the network fails, or the API does not initialise in time.
 */
export function loadGoogleMaps(timeoutMs = 12000): Promise<GoogleNS> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (!GOOGLE_BROWSER_KEY) return Promise.reject(new Error("Google Maps key not configured"));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      loading = null;
      reject(new Error("Google Maps timed out"));
    }, timeoutMs);
    window.__makePayMapsReady = () => {
      clearTimeout(timer);
      resolve(window.google);
    };
    const s = document.createElement("script");
    const params = new URLSearchParams({ key: GOOGLE_BROWSER_KEY, v: "weekly", loading: "async", callback: "__makePayMapsReady", region: "RW" });
    s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    s.async = true;
    s.onerror = () => {
      clearTimeout(timer);
      loading = null;
      s.remove();
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}
