# Mâke pay — Frontend

> **Know your route. Know your fare. Pay with confidence.**

Mâke pay is a mobility-fintech concept for Kigali, Rwanda: passengers see the route and an estimated moto-taxi fare before they ride, follow distance and fare during the trip, and pay the rider by MTN MoMo with every line of the bill visible.

This repository is **phase 1: frontend only.** There is no backend, database, authentication, real GPS or real payment. Everything that would need a server runs through **clearly separated mock services** that use deterministic fixtures, so you can swap in real APIs later without touching UI components.

---

## Contents

- [Quick start](#quick-start)
- [What's inside](#whats-inside)
- [Project structure](#project-structure)
- [The demo engine](#the-demo-engine)
- [Illustrative pricing assumptions](#illustrative-pricing-assumptions)
- [Integrating real APIs](#integrating-real-apis)
- [Deploying to Vercel](#deploying-to-vercel)
- [Implemented vs simulated](#implemented-vs-simulated)
- [Design system](#design-system)
- [Accessibility & performance](#accessibility--performance)

---

## Quick start

**Requirements:** Node.js 20.9 or newer, npm 10 or newer.

```bash
npm install          # also copies the MapLibre worker into /public (postinstall)
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build, including type checking |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate:scenes` | Regenerate the illustrated hero scenes in `public/images` |

Optional environment variables are listed in [`.env.example`](./.env.example). Copy it to `.env.local` to override. None are required.

### Try the demo

1. Open `/` and go through the landing page, or go straight to **Try Mâke pay** (`/app`).
2. Tap the **Downtown → Kimironko** sample journey and press **Check fare**.
3. **Start journey.** Ride time is compressed (1 s ≈ 30 s of riding; tap **2×** under *More details* to go faster).
4. Optional: press **Extend** to continue to a nearby destination. The extra distance is itemised.
5. **End journey** → **Continue to payment**. Enter a rider number such as `078 812 3456`.
6. Pick a **Demo outcome** (Success / Cancelled / Failed) and **Confirm payment**.
7. View the receipt, then open **History**.

With **Success** selected, test numbers also set the outcome: numbers ending in `0000` fail and numbers ending in `1111` are cancelled.

---

## What's inside

### Marketing site (`/`)

| Section | Notes |
| --- | --- |
| **Cinematic hero carousel** | Three full-bleed slides with clip-path wipes, a slow Ken Burns zoom, staggered headline reveals, autoplay progress bars (paused on hover or focus, and off when reduced motion is on), arrows, keyboard ←/→ and swipe. |
| **The problem** | Editorial typography and an animated price comparison for one trip, marked as an *illustrative scenario*. |
| **Sticky stacking cards** | *Estimate · Track · Pay*: three cards with their own compositions that scale and stack as you scroll. |
| **Scroll-driven phone showcase** | A pinned phone that steps through five real app screens: search, route, fare, tracking and paid. |
| **Kigali route explorer** | Sample journeys run through the mock routing service, showing distance, time and a fare breakdown. Each one links into the app. |
| **Why Mâke pay** | Benefits for passengers and for riders in an editorial two-column layout. |
| **Payment transparency** | An animated receipt: **1,500 RWF fare + 20 RWF proposed fee = 1,520 RWF**, labelled illustrative. |
| **FAQ + final CTA** | A Radix accordion, then *"Every ride deserves clarity."* with **Try the App**. |

### Passenger app (`/app`)

| Route | Screen |
| --- | --- |
| `/app` | Home: greeting (Kinyarwanda, by time of day), start point with simulated "locate me", destination search, recent destinations, sample journeys, **Check fare** |
| `/app/route?from=&to=` | Route preview: interactive map, origin and destination markers, recommended route, distance, time, fare estimate with breakdown, **Start journey** |
| `/app/journey` | Active journey: large running fare, travelled and remaining distance, elapsed time, animated rider marker, GPS status, destination extension, demo speed, **End journey** (asks to confirm if you end early) |
| `/app/journey/complete` | Summary: distance, time, extra distance, final fare with tariff label, **Continue to payment** |
| `/app/checkout` | MoMo checkout: rider number with validation (Zod + React Hook Form), fare breakdown, 20 RWF fee, total, demo outcome picker, then pending, successful, cancelled or failed |
| `/app/receipt/[id]` | Digital receipt: date and time, route, distance, fare, fee, status and reference. Share uses the share sheet or copies to the clipboard |
| `/app/history` | Previous trips (three seeded fixtures plus your own), total paid, clear history |

Every screen has loading, empty and error states. The app shows a persistent **Demo mode** banner, which turns into an **offline** banner when the connection drops.

---

## Project structure

```
src/
├─ app/                        # Next.js App Router
│  ├─ page.tsx                 # Marketing landing page
│  ├─ layout.tsx               # Fonts, metadata, MotionConfig
│  ├─ globals.css              # Tailwind v4 @theme tokens
│  └─ app/                     # Passenger app (/app/*)
├─ components/
│  ├─ brand/                   # Logo + wordmark
│  ├─ ui/                      # shadcn-style primitives (Button, Input, Accordion, DemoTag)
│  ├─ marketing/               # Landing page sections + phone mockup screens
│  ├─ trip/                    # Map (MapLibre + schematic fallback), bottom sheet, route/journey views
│  ├─ payment/                 # MoMo checkout, payment hook, receipt
│  └─ app/                     # App chrome (header, demo banner, empty/loading states)
├─ hooks/                      # useHydrated, useOnline, useMediaQuery, useTripSimulation
├─ lib/
│  ├─ services/
│  │  ├─ contracts.ts          # ← Service interfaces (the integration seam)
│  │  ├─ index.ts              # ← Registry: mock vs live
│  │  └─ live.ts               # Typed HTTP adapter stubs for the future backend
│  ├─ mock-services/
│  │  ├─ fixtures/             # Kigali demo road graph, places, sample journeys, tariff
│  │  ├─ routing.mock.ts       # Dijkstra over the demo graph
│  │  ├─ fare.mock.ts          # Pure fare calculation
│  │  ├─ trip-simulator.ts     # Deterministic trip progression + extensions
│  │  ├─ payment.mock.ts       # Simulated MoMo collection (never asks for a PIN)
│  │  ├─ receipt.mock.ts       # Receipt builder + seeded history
│  │  └─ location.mock.ts      # Simulated start location + GPS signal
│  ├─ geo.ts, format.ts, phone.ts, media.ts, utils.ts
├─ store/trip-store.ts         # Zustand (persisted to localStorage)
└─ types/index.ts              # Shared domain types
public/images/                 # Original illustrated scenes (swap for photography — see media.ts)
scripts/                       # Scene generator, MapLibre worker copy
```

**Rule:** visual components never import from `mock-services` for data. They call `services` from `@/lib/services`. The only exceptions are pure helpers such as `quoteFare` and `computeRoute`, which marketing mockups use synchronously so that the illustrations show exactly what the demo engine produces.

---

## The demo engine

| Capability | Where |
| --- | --- |
| Select a sample journey | `SAMPLE_JOURNEYS` in `fixtures/kigali-graph.ts` |
| Mock route coordinates | `routing.mock.ts` runs Dijkstra on a hand-placed graph of about 26 Kigali junctions, smoothed with Catmull–Rom |
| Demo distance and fare | Graph distance × 1.16 road factor, rounded to 0.1 km, then `quoteFare()` |
| Start a simulated trip | `createTrip()` in `trip-simulator.ts` |
| Progress along the route | `advanceTrip()`: deterministic speed profile (about 24 km/h with traffic waves), time compressed 30× |
| Travelled distance updates | `useTripSimulation` ticks at 4 Hz, which is light on low-end Android |
| Destination extension | `extendTrip()` appends a new route segment. The summary itemises the extra km and RWF |
| End trip and fare summary | `completeTrip()` returns the planned and final quote and the extra distance |
| MoMo outcomes | `payment.mock.ts`: initiating → pending → successful / cancelled / failed, abortable |
| Receipt | `buildReceipt()` with a stable, deterministic id |

**Nothing is random.** The same journey always gives the same route, distance and fare across refreshes and devices. Trip progress depends only on elapsed time, and payment outcomes follow the explicit demo choice or the test number.

The app never claims real GPS tracking, official fare verification or real payments. These are labelled *Simulated*, *Illustrative* or *Demonstration* wherever they appear.

---

## Illustrative pricing assumptions

Defined in `src/lib/mock-services/fixtures/tariff.ts`. **These are not official or regulator-approved fares.**

| Parameter | Value |
| --- | --- |
| Base fare (covers the first 2 km) | 400 RWF |
| Per additional km | 160 RWF |
| Rounding | Nearest 50 RWF (half rounds up) |
| Platform fee (proposed, flat per trip) | 20 RWF |
| Demo average speed | 24 km/h |
| Road factor on graph distance | 1.16 |

Resulting demonstration fares:

| Journey | Demo distance | Fare | Total with fee |
| --- | --- | --- | --- |
| Downtown → Remera | 7.0 km | 1,200 RWF | 1,220 RWF |
| Downtown → Kimironko | 8.9 km | **1,500 RWF** | **1,520 RWF** |
| Downtown → Nyamirambo | 5.0 km | 900 RWF | 920 RWF |
| Downtown → Airport | 11.0 km | 1,850 RWF | 1,870 RWF |

The 1,500 + 20 = 1,520 RWF payment scenario on the landing page is the Downtown → Kimironko demo journey.

---

## Integrating real APIs

All data access goes through four interfaces in `src/lib/services/contracts.ts`:

```ts
RoutingService   // listPlaces, searchPlaces, getPlace, getRoute, getExtensionOptions
FareService      // getTariff, quote
LocationService  // getCurrentPlace, signalAt
PaymentService   // requestPayment(request, onStatus, signal)
```

To go live:

1. Implement the interfaces in `src/lib/services/live.ts`. Typed stubs and suggested endpoints are already there.
2. Set `NEXT_PUBLIC_USE_MOCKS=false`.
3. Suggested backends:
   - **Routing:** OSRM, Valhalla or GraphHopper, behind your own API.
   - **Fares:** serve the regulator-approved tariff from the server and quote fares on the server, not in the browser.
   - **GPS:** `navigator.geolocation.watchPosition` plus server-side map-matching. Feed positions into the same `Trip` shape.
   - **Payments:** MTN MoMo Collections (`requesttopay`), called **only from your server**. Poll the status or use a webhook, and map it to `PaymentStatus`.
4. **Never put secrets in `NEXT_PUBLIC_*` variables.** API keys for MoMo, routing or maps belong in server-side Route Handlers or a separate backend.

The map style comes from `NEXT_PUBLIC_MAP_STYLE_URL`. The default is **OpenFreeMap Positron**, which needs no key. Any MapLibre-compatible style works, such as MapTiler or Stadia, but put keyed URLs behind a proxy if the provider requires it.

---

## Deploying to Vercel

1. Push this folder to a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel, choose **Add New → Project** and import the repository. The framework preset is detected as **Next.js**.
3. Leave the build settings at their defaults (`npm install`, `npm run build`). The `postinstall` script copies the MapLibre worker automatically.
4. Optional: under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` (your production URL, used for Open Graph) and `NEXT_PUBLIC_MAP_STYLE_URL`.
5. Click **Deploy.**

Or use the CLI:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

All pages are static except `/app/receipt/[id]`, which is rendered on demand and reads the receipt from the browser.

---

## Implemented vs simulated

### ✅ Implemented (real, working frontend)

- Complete responsive marketing site with every section described above
- Full passenger flow: search, route, journey, extension, summary, checkout, receipt and history
- Interactive **MapLibre GL** map with route, travelled path, markers and fit-to-route
- **Automatic schematic fallback** when WebGL is missing, the device is offline or tiles fail, plus a manual **Lite view** toggle
- Form validation for Rwandan MTN numbers (`078`/`079`, `+250` accepted)
- Persisted state (Zustand + localStorage): an in-progress trip survives a page refresh
- Loading, empty, offline, failure and success states
- Reduced-motion support, keyboard navigation, focus styles, ARIA roles and live regions
- Typed service layer ready for backend integration

### 🧪 Simulated (clearly labelled in the UI)

- **Routes:** a hand-placed demonstration graph, not survey data
- **Fares:** an illustrative tariff, not an official RURA schedule
- **GPS:** no device location is read. Signal quality is deterministic by progress
- **Trip timing:** compressed 30× (or 60× at 2× speed)
- **MoMo payments:** no network request is made, no money moves and **no PIN is ever requested**
- **Receipts and history:** stored only in this browser's localStorage

### ⏭️ Not in this phase

Backend, database, authentication, rider accounts, real-time rider–passenger pairing, production GPS tracking, live MoMo integration, notifications, internationalisation (Kinyarwanda/French UI), analytics.

---

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Forest Green | `#123D35` | Primary, dark surfaces |
| Electric Lime | `#D9F068` | Accent, CTAs on dark, progress |
| Warm Cream | `#F8F6F0` | Page background |
| Ink | `#1D2525` | Body text |
| Soft Stone | `#E8E6DF` | Secondary surfaces |

- **Type:** Bricolage Grotesque (display; variable, self-hosted) + Geist Sans and Geist Mono (UI). Fonts load through `next/font` at build time, so nothing is fetched from Google at runtime.
- **Primitives:** shadcn/ui-style components built on the unified `radix-ui` package with `class-variance-authority`.
- **Motion:** `motion/react` throughout, wrapped in `MotionConfig reducedMotion="user"`.
- **Imagery:** the hero and editorial scenes in `public/images` are **original, art-directed SVG illustrations** of Kigali's hills (generated by `scripts/generate-scenes.mjs`). To use licensed photography, add the files to `public/images` and update `src/lib/media.ts`.

The brand name is always written **Mâke pay**: capital M, accented â, lowercase *pay*.

---

## Accessibility & performance

- Mobile-first layouts with touch targets of 44 px or more, safe-area insets and a draggable bottom sheet (tap the handle as an alternative to dragging)
- WCAG-conscious contrast: cream and lime on forest, ink on cream
- `prefers-reduced-motion` disables autoplay, parallax-style transitions and count-ups
- MapLibre and its worker are loaded only on map screens. The landing page uses a lightweight SVG schematic
- The simulation ticks at 4 Hz with no requestAnimationFrame loop, which keeps the CPU light on affordable Android devices
- Fonts are self-hosted, illustrations are small SVGs (about 20–90 kB) and the site uses no third-party scripts

---

© 2026 Mâke pay. Product prototype for Kigali, Rwanda. All fares shown are illustrative. Map data © OpenStreetMap contributors.
