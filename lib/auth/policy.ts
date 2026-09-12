export const SCHOOL_DOMAIN = "snu.ac.kr";
export function schoolEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parts = value.toLowerCase().split("@");
  return (
    parts.length === 2 &&
    parts[0].length > 0 &&
    parts[1] === SCHOOL_DOMAIN &&
    !/\s/.test(value)
  );
}
export function allowedGoogleProfile(
  provider: unknown,
  profile: unknown,
): boolean {
  if (provider !== "google" || !profile || typeof profile !== "object")
    return false;
  const p = profile as Record<string, unknown>;
  return (
    schoolEmail(p.email) &&
    p.email_verified === true &&
    p.hd === SCHOOL_DOMAIN &&
    typeof p.sub === "string" &&
    p.sub.length > 0
  );
}
export function adminEmail(
  email: string,
  allowlist: string | undefined,
): boolean {
  return (
    schoolEmail(email) &&
    (allowlist ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase())
  );
}
export function sameOrigin(request: Request, canonicalUrl?: string): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const expected = new URL(canonicalUrl || request.url);
    // Next.js can use an internal hostname in request.url. The browser's Host
    // header identifies the actual local origin; deployed apps use AUTH_URL.
    if (!canonicalUrl && request.headers.get("host")) {
      expected.host = request.headers.get("host")!;
    }
    return new URL(origin).origin === expected.origin;
  } catch {
    return false;
  }
}
