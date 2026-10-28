import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const bricolage = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Mâke pay — Know your route. Know your fare.", template: "%s · Mâke pay" },
  description:
    "Mâke pay brings fare transparency to moto rides in Kigali. Know your route. Know your fare. Pay with confidence.",
  applicationName: "Mâke pay",
  openGraph: {
    title: "Mâke pay",
    description: "Know your route. Know your fare. Pay with confidence.",
    images: ["/images/photos/moto-sunset-kigali.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. password managers, McAfee WebAdvisor)
    // inject attributes into <html>/<body> before React hydrates. Only affects these two tags.
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${instrument.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-forest"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
