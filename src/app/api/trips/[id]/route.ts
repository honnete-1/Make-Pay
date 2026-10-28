import { NextResponse } from "next/server";
import type { RouteSummary, Trip, TripSummary } from "@/types";
import { completeTrip, extendTrip } from "@/lib/mock-services/trip-simulator";
import { getSessionId } from "@/lib/server/session";
import { getTrip, saveTrip, toPublicTrip } from "@/lib/server/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const sessionId = await getSessionId();
  const { id } = await ctx.params;
  const trip = getTrip(sessionId, id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json(toPublicTrip(trip));
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const sessionId = await getSessionId();
  const { id } = await ctx.params;
  const existing = getTrip(sessionId, id);
  if (!existing) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = (await req.json()) as {
    action?: "extend" | "complete" | "sync";
    extension?: RouteSummary;
    trip?: Trip;
    summary?: TripSummary;
  };

  if (body.action === "extend" && body.extension) {
    const trip = extendTrip(existing, body.extension);
    return NextResponse.json(saveTrip(sessionId, trip));
  }

  if (body.action === "complete") {
    const source = body.trip ?? existing;
    const { trip, summary } = completeTrip(source);
    return NextResponse.json(saveTrip(sessionId, trip, summary));
  }

  if (body.trip) {
    return NextResponse.json(saveTrip(sessionId, body.trip, body.summary ?? existing.summary));
  }

  return NextResponse.json({ error: "Unsupported patch" }, { status: 400 });
}
