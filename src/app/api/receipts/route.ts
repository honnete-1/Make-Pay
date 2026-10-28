import { NextResponse } from "next/server";
import type { Receipt } from "@/types";
import { getSessionId } from "@/lib/server/session";
import { addReceipt, clearReceipts, listReceipts } from "@/lib/server/store";

export async function GET() {
  const sessionId = await getSessionId();
  return NextResponse.json(listReceipts(sessionId));
}

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const receipt = (await req.json()) as Receipt;
  if (!receipt?.id || !receipt.tripId) {
    return NextResponse.json({ error: "Invalid receipt" }, { status: 400 });
  }
  return NextResponse.json(addReceipt(sessionId, receipt));
}

export async function DELETE() {
  const sessionId = await getSessionId();
  clearReceipts(sessionId);
  return NextResponse.json({ ok: true });
}
