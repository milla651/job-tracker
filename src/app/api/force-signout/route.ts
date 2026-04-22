import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Called when a session exists but has no user ID (broken JWT).
// Clears all auth cookies then sends the browser to /login with a clean slate.
export async function GET(req: NextRequest) {
  const jar = await cookies();
  const authCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
  ];
  for (const name of authCookieNames) {
    jar.delete(name);
  }
  return Response.redirect(new URL("/login", req.url), 307);
}
