import { NextResponse } from "next/server";
import type { RouteSummary, Trip, TripSummary } from "@/types";
import { createTrip } from "@/lib/mock-services/trip-simulator";
import { getSessionId } from "@/lib/server/session";
import { saveTrip } from "@/lib/server/store";

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const body = (await req.json()) as { route?: RouteSummary; trip?: Trip };
  const trip = body.trip ?? (body.route ? createTrip(body.route) : null);
  if (!trip) {
    return NextResponse.json({ error: "trip or route is required" }, { status: 400 });
  }
  const stored = saveTrip(sessionId, trip);
  return NextResponse.json(stored);
}

export async function PATCH(req: Request) {
  const sessionId = await getSessionId();
  const body = (await req.json()) as {
    trip?: Trip;
    summary?: TripSummary;
  };
  if (!body.trip) {
    return NextResponse.json({ error: "trip is required" }, { status: 400 });
  }
  const stored = saveTrip(sessionId, body.trip, body.summary);
  return NextResponse.json(stored);
}
