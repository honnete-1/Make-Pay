import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/server/session";
import { getPayment } from "@/lib/server/store";

export async function GET(_req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const sessionId = await getSessionId();
  const { ref } = await ctx.params;
  const payment = getPayment(sessionId, ref);
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  const { sessionId: _s, tripId: _t, ...result } = payment;
  return NextResponse.json(result);
}
