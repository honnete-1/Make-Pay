import { NextResponse } from "next/server";
import { PLACES } from "@/lib/mock-services/fixtures/kigali-graph";
import { getSessionId } from "@/lib/server/session";

export async function GET(req: Request) {
  await getSessionId();
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json(PLACES);
  const results = PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.includes(q)),
  );
  return NextResponse.json(results);
}
