import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { learningItems } from "@/lib/learning-items";
import { validProgressChange } from "@/lib/progress-policy";
import { readProgress, writeProgress } from "@/lib/progress-repository";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { courseAccess } from "@/lib/course";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentActor();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    return json({
      ownerId: user.id,
      values: await readProgress(query, user.id),
    });
  } catch {
    return json({ error: "학습 기록을 불러오지 못했습니다." }, 503);
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request, process.env.AUTH_URL))
    return json({ error: "허용되지 않은 요청입니다." }, 403);
  try {
    const user = await currentActor();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    if (request.headers.get("x-progress-owner") !== user.id)
      return json(
        { error: "계정이 바뀌었습니다. 기록을 다시 불러오세요." },
        409,
      );
    let change;
    try {
      change = validProgressChange(
        await smallJson(request),
        new Set(learningItems().map((i) => i.id)),
      );
    } catch {
      return json({ error: "잘못된 요청입니다." }, 400);
    }
    if (!change)
      return json(
        { error: "존재하는 개념·과제와 완료 여부만 전송할 수 있습니다." },
        400,
      );
    const { weeks } = await courseAccess();
    const item = learningItems().find((i) => i.id === change.id);
    if (!item || !weeks.includes(item.week))
      return json({ error: "먼저 해당 주차의 잠금을 해제하세요." }, 403);
    await writeProgress(query, user.id, change.id, change.completed);
    return json({ ok: true });
  } catch {
    return json({ error: "저장하지 못했습니다. 다시 시도해 주세요." }, 503);
  }
}
