import { NextRequest, NextResponse } from "next/server";
import {
  contentSecurityPolicy,
  rejectRequest,
  securityHeaders,
} from "./lib/request-security";

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
  );
  const rejection = rejectRequest(
    request,
    process.env.AUTH_URL,
    process.env.VERCEL === "1",
  );
  const headers = new Headers(request.headers);
  // Replace client-supplied policy/nonces before Next renders framework scripts.
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = rejection
    ? NextResponse.json(
        { error: rejection.error },
        { status: rejection.status },
      )
    : NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  for (const header of securityHeaders)
    response.headers.set(header.key, header.value);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
