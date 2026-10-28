import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Mâke pay",
    short_name: "Mâke pay",
    description: "Know your route. Know your fare. Pay with confidence.",
    start_url: "/app?source=pwa",
    scope: "/app",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    categories: ["travel", "finance", "navigation"],
    prefer_related_applications: false,
    background_color: "#F8F6F0",
    theme_color: "#123D35",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
