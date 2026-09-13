import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { learningItems } from "@/lib/learning-items";
import { validImport } from "@/lib/progress-policy";
import { importProgress, readProgress } from "@/lib/progress-repository";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { courseAccess } from "@/lib/course";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
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
    let ids;
    try {
      ids = validImport(
        await smallJson(request),
        new Set(learningItems().map((i) => i.id)),
      );
    } catch {
      return json({ error: "잘못된 요청입니다." }, 400);
    }
    if (!ids) return json({ error: "잘못된 학습 기록입니다." }, 400);
    const { weeks } = await courseAccess();
    if (
      ids.some(
        (id) => !weeks.includes(learningItems().find((i) => i.id === id)!.week),
      )
    )
      return json(
        {
          error:
            "잠긴 주차의 기록이 포함되어 있습니다. 해당 주차를 연 뒤 가져오세요.",
        },
        403,
      );
    const imported = await importProgress(query, user.id, ids);
    return json({ imported, values: await readProgress(query, user.id) });
  } catch {
    return json(
      { error: "기록을 가져오지 못했습니다. 다시 시도해 주세요." },
      503,
    );
  }
}
