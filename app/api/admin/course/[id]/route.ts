import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { query } from "@/lib/query";
import { json, smallJson } from "@/lib/http";
import { validWeek, validateQuiz } from "@/lib/course-policy";
import { hashPassword } from "@/lib/quiz-password";
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
    const week = Number((await params).id);
    if (!validWeek(week)) return json({ error: "잘못된 주차입니다." }, 400);
    let data;
    try {
      data = await smallJson(request, 600000);
    } catch {
      return json({ error: "입력 크기 또는 형식을 확인하세요." }, 400);
    }
    let saved;
    if (data?.kind === "lesson") {
      if (
        typeof data.body !== "string" ||
        !data.body.trim() ||
        data.body.length > 150000 ||
        !Number.isInteger(data.revision) ||
        data.revision < 0
      )
        return json(
          { error: "본문과 버전을 확인하세요. 최대 150,000자입니다." },
          400,
        );
      saved =
        data.revision === 0
          ? await query(
              "INSERT INTO lesson_edits(week,body) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING revision",
              [week, data.body],
            )
          : await query(
              "UPDATE lesson_edits SET body=$2,revision=revision+1,updated_at=now() WHERE week=$1 AND revision=$3 RETURNING revision",
              [week, data.body, data.revision],
            );
    } else if (data?.kind === "quiz" && week >= 2) {
      const draft = validateQuiz(data);
      if (!draft)
        return json(
          {
            error:
              "문항 번호는 중복 없이 입력하고, 공개할 때는 문항·정답·조합 설명을 모두 채워 주세요. 이미지는 HTTPS 주소만 가능합니다.",
          },
          400,
        );
      const [old] = await query(
        "SELECT password_hash FROM week_quizzes WHERE week=$1",
        [week],
      );
      const hash = draft.password
        ? hashPassword(draft.password)
        : String(old?.password_hash || "");
      if (draft.published && !hash)
        return json(
          { error: "공개 전에 실제 잠금 해제 암호를 설정하세요." },
          400,
        );
      const args = [
        week,
        JSON.stringify(draft.questions),
        draft.instructions,
        hash,
        draft.published,
      ];
      saved =
        draft.revision === 0
          ? await query(
              "INSERT INTO week_quizzes(week,questions,instructions,password_hash,published) VALUES($1,$2::jsonb,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING revision",
              args,
            )
          : await query(
              "UPDATE week_quizzes SET questions=$2::jsonb,instructions=$3,password_hash=$4,published=$5,revision=revision+1,updated_at=now() WHERE week=$1 AND revision=$6 RETURNING revision",
              [...args, draft.revision],
            );
    } else return json({ error: "잘못된 편집 요청입니다." }, 400);
    if (!saved.length)
      return json(
        {
          error:
            "다른 창에서 수정되었습니다. 작성 내용을 복사한 뒤 새로고침해 주세요.",
        },
        409,
      );
    return json({ ok: true, revision: Number(saved[0].revision) });
  } catch {
    return json(
      { error: "저장하지 못했습니다. DB migration과 연결 상태를 확인하세요." },
      503,
    );
  }
}
