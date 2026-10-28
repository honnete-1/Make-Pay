import { Suspense } from "react";
import { RoutePreview } from "@/components/trip/route-preview";
import { LoadingScreen } from "@/components/app/app-chrome";

export const metadata = { title: "Route preview" };

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading route…" />}>
      <RoutePreview />
    </Suspense>
  );
}
