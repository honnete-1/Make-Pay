import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { MotionProvider } from "@/components/motion-provider";
import { InstallProvider } from "@/components/pwa/install-context";
import { SerwistProvider } from "./serwist";
import "./globals.css";

const bricolage = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Mâke pay — Know your route. Know your fare.", template: "%s · Mâke pay" },
  description:
    "Mâke pay brings fare transparency to moto rides in Kigali. Know your route. Know your fare. Pay with confidence.",
  applicationName: "Mâke pay",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mâke pay",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Mâke pay",
    description: "Know your route. Know your fare. Pay with confidence.",
    images: ["/images/hero-1.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#123D35",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-forest"
        >
          Skip to content
        </a>
        <SerwistProvider swUrl="/sw.js">
          <MotionProvider>
            <InstallProvider>{children}</InstallProvider>
          </MotionProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
