import { NextResponse } from "next/server";
import { DEMO_TARIFF } from "@/lib/mock-services/fixtures/tariff";
import { quoteFare } from "@/lib/mock-services/fare.mock";
import { getSessionId } from "@/lib/server/session";

export async function GET(req: Request) {
  await getSessionId();
  const distance = new URL(req.url).searchParams.get("distanceKm");
  if (distance != null) {
    const km = Number(distance);
    if (!Number.isFinite(km)) {
      return NextResponse.json({ error: "distanceKm must be a number" }, { status: 400 });
    }
    return NextResponse.json({ tariff: DEMO_TARIFF, quote: quoteFare(km) });
  }
  return NextResponse.json(DEMO_TARIFF);
}
