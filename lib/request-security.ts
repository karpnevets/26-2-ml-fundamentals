import { sameOrigin } from "./auth/policy";

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

export function contentSecurityPolicy(nonce: string, development = false) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    // KaTeX and React's SVG playgrounds use inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self' data:",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self' https://accounts.google.com",
    ...(!development ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function rejectRequest(
  request: Request,
  canonicalUrl?: string,
  deployed = false,
): { status: number; error: string } | null {
  if (request.url.length > 8192)
    return { status: 414, error: "요청 주소가 너무 깁니다." };
  const path = new URL(request.url).pathname;
  if (
    !["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"].includes(
      request.method,
    )
  )
    return { status: 405, error: "허용되지 않은 요청 방식입니다." };
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    if ((deployed && !canonicalUrl) || !sameOrigin(request, canonicalUrl))
      return { status: 403, error: "허용되지 않은 요청 출처입니다." };
    const length = request.headers.get("content-length");
    const limit = path.startsWith("/api/admin/course/")
      ? 600000
      : path.startsWith("/api/auth/") || path === "/login"
        ? 65536
        : 16384;
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit))
      return { status: 413, error: "요청 크기가 너무 큽니다." };
  }
  // OAuth callbacks are top-level navigation from Google and must stay allowed.
  if (
    path.startsWith("/api/") &&
    !path.startsWith("/api/auth/") &&
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return {
      status: 403,
      error: "다른 사이트에서 보낸 API 요청은 허용하지 않습니다.",
    };
  return null;
}
