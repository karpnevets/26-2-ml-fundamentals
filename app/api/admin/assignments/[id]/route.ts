import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { validProjectId, validateProject } from "@/lib/project-policy";
import { saveProject } from "@/lib/project-repository";
export const dynamic = "force-dynamic";
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request, process.env.AUTH_URL))
    return json({ error: "허용되지 않은 요청입니다." }, 403);
  try {
    const user = await currentActor();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    if (!user.isAdmin) return json({ error: "관리자 권한이 필요합니다." }, 403);
    const { id } = await params;
    if (!validProjectId(id)) return json({ error: "잘못된 과제입니다." }, 400);
    let draft;
    try {
      draft = validateProject(await smallJson(request, 500000));
    } catch {
      return json({ error: "입력 크기와 형식을 확인하세요." }, 400);
    }
    if (!draft)
      return json(
        { error: "제목·주차·본문을 확인하세요. 공개하려면 본문이 필요합니다." },
        400,
      );
    const revision = await saveProject(query, id, draft);
    if (revision === null)
      return json(
        {
          error:
            "다른 창에서 수정되었거나 과제가 없습니다. 작성 내용을 복사한 뒤 새로고침하세요.",
        },
        409,
      );
    return json({ ok: true, revision });
  } catch {
    return json(
      { error: "저장하지 못했습니다. 잠시 후 다시 시도하세요." },
      503,
    );
  }
}
