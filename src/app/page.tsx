import { SiteHeader } from "@/components/marketing/site-header";
import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { ProblemSection } from "@/components/marketing/problem-section";
import { StackingCards } from "@/components/marketing/stacking-cards";
import { PhoneShowcase } from "@/components/marketing/phone-showcase";
import { RouteExplorer } from "@/components/marketing/route-explorer";
import { WhySection } from "@/components/marketing/why-section";
import { PaymentTransparency } from "@/components/marketing/payment-transparency";
import { FaqSection, FinalCta, SiteFooter } from "@/components/marketing/faq-cta";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HeroCarousel />
        <ProblemSection />
        <StackingCards />
        <PhoneShowcase />
        <RouteExplorer />
        <WhySection />
        <PaymentTransparency />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
