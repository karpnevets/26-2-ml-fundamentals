import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { validProjectId } from "@/lib/project-policy";
import { validRevision, validUserId } from "@/lib/submission-policy";
import {
  saveFeedback,
  submissionStorageReady,
} from "@/lib/submission-repository";
import { requestLimit } from "@/lib/rate-limit";
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
    let data;
    try {
      data = await smallJson(request, 24000);
    } catch {
      return json({ error: "피드백은 5,000자 이하로 입력하세요." }, 400);
    }
    if (
      !validProjectId(id) ||
      typeof data?.userId !== "string" ||
      !validUserId(data.userId) ||
      !validRevision(data.revision) ||
      typeof data.feedback !== "string" ||
      !data.feedback.trim() ||
      data.feedback.length > 5000
    )
      return json(
        { error: "대상과 피드백을 확인하세요. 최대 5,000자입니다." },
        400,
      );
    const limited = await requestLimit(user.id, "write");
    if (limited) return limited;
    if (!(await submissionStorageReady(query)))
      return json({ error: "제출용 SQL을 먼저 적용해 주세요." }, 503);
    const submission = await saveFeedback(
      query,
      id,
      data.userId,
      user.id,
      data.revision,
      data.feedback.trim(),
    );
    return submission
      ? json({ submission })
      : json(
          {
            error:
              "학생이 파일을 교체했거나 다른 창에서 수정했습니다. 피드백을 복사한 뒤 새로고침해 주세요.",
          },
          409,
        );
  } catch {
    return json(
      { error: "피드백을 저장하지 못했습니다. 다시 시도해 주세요." },
      503,
    );
  }
}
