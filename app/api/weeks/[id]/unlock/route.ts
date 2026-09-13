import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { validWeek } from "@/lib/course-policy";
import { unlockWeek } from "@/lib/unlock-repository";
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request, process.env.AUTH_URL))
    return json({ error: "허용되지 않은 요청입니다." }, 403);
  try {
    const user = await currentActor();
    if (!user) return json({ error: "학교 계정으로 로그인해 주세요." }, 401);
    const week = Number((await params).id);
    if (!validWeek(week, 2)) return json({ error: "잘못된 주차입니다." }, 400);
    let body;
    try {
      body = await smallJson(request);
    } catch {
      return json({ error: "잘못된 요청입니다." }, 400);
    }
    if (typeof body?.password !== "string" || body.password.length > 200)
      return json({ error: "암호를 입력하세요." }, 400);
    const result = await unlockWeek(
      query,
      user.id,
      week,
      body.password,
      user.isAdmin,
    );
    return json(result, result.status);
  } catch {
    return json(
      { error: "잠금 해제를 처리하지 못했습니다. 잠시 후 다시 시도하세요." },
      503,
    );
  }
}
