import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div>
        <Logo className="justify-center" />
        <p className="mt-10 font-display text-7xl font-semibold tracking-tight text-forest">404</p>
        <p className="mt-3 text-lg text-ink-soft">This road doesn’t lead anywhere — yet.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="outline"><Link href="/">Home</Link></Button>
          <Button asChild><Link href="/app">Open the demo</Link></Button>
        </div>
      </div>
    </main>
  );
}
