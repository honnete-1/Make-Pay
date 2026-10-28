import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const SESSION_COOKIE = "make_pay_session";

/** Read or create the passenger session id (httpOnly cookie). */
export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
