import { NextResponse } from "next/server";
import { computeRoute } from "@/lib/mock-services/routing.mock";
import { getSessionId } from "@/lib/server/session";

export async function POST(req: Request) {
  await getSessionId();
  const body = (await req.json()) as { originId?: string; destinationId?: string };
  const { originId, destinationId } = body;
  if (!originId || !destinationId) {
    return NextResponse.json({ error: "originId and destinationId are required" }, { status: 400 });
  }
  if (originId === destinationId) {
    return NextResponse.json({ error: "Choose a destination different from your starting point." }, { status: 400 });
  }
  try {
    const route = computeRoute(originId, destinationId);
    return NextResponse.json(route);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Route unavailable" }, { status: 404 });
  }
}
