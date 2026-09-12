import { handlers } from "@/auth";
import { authConfigured } from "@/lib/auth/config";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const unavailable = () =>
  Response.json(
    { error: "로그인 설정을 완료해 주세요." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
export const GET: typeof handlers.GET = async (request) =>
  authConfigured() ? handlers.GET(request) : unavailable();
export const POST: typeof handlers.POST = async (request) =>
  authConfigured() ? handlers.POST(request) : unavailable();
