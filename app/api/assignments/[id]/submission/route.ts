import { currentActor } from "@/lib/auth/actor";
import { sameOrigin } from "@/lib/auth/policy";
import { courseAccess } from "@/lib/course";
import { query } from "@/lib/query";
import { json, smallJson, smallText } from "@/lib/http";
import { validProjectId } from "@/lib/project-policy";
import {
  MAX_NOTEBOOK_BYTES,
  validNotebook,
  validRevision,
  validUserId,
} from "@/lib/submission-policy";
import {
  canSubmitProject,
  readNotebook,
  requestFeedback,
  submissionStorageReady,
  uploadSubmission,
} from "@/lib/submission-repository";
import { requestLimit } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const unavailable = () =>
  json(
    { error: "제출 기능을 준비 중입니다. 잠시 후 다시 시도해 주세요." },
    503,
  );
const conflict = () =>
  json(
    { error: "파일 또는 요청 상태가 바뀌었습니다. 새로고침 후 확인해 주세요." },
    409,
  );
async function mutate(request: Request, context: Context, upload: boolean) {
  if (!sameOrigin(request, process.env.AUTH_URL))
    return json({ error: "허용되지 않은 요청입니다." }, 403);
  try {
    const { user, completed } = await courseAccess();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    if (request.headers.get("x-submission-owner") !== user.id)
      return json({ error: "계정이 바뀌었습니다. 새로고침해 주세요." }, 409);
    const { id } = await context.params;
    if (!validProjectId(id)) return json({ error: "잘못된 과제입니다." }, 400);
    const limited = await requestLimit(user.id, "write");
    if (limited) return limited;
    if (!(await submissionStorageReady(query))) return unavailable();
    if (!(await canSubmitProject(query, id, completed)))
      return json(
        {
          error: "공개된 과제의 해당 주차 학습을 완료해야 제출할 수 있습니다.",
        },
        403,
      );
    if (upload) {
      const header = request.headers.get("x-submission-revision");
      const revision = Number(header);
      if (
        header === null ||
        !/^\d+$/.test(header) ||
        !validRevision(revision, true)
      )
        return json({ error: "파일 버전을 확인해 주세요." }, 400);
      if (
        !request.headers
          .get("content-type")
          ?.toLowerCase()
          .startsWith("application/json")
      )
        return json({ error: ".ipynb 파일을 선택해 주세요." }, 400);
      let filename, notebook;
      try {
        filename = decodeURIComponent(
          request.headers.get("x-notebook-filename") || "",
        );
        notebook = await smallText(request, MAX_NOTEBOOK_BYTES);
      } catch {
        return json(
          {
            error:
              "파일을 읽지 못했습니다. UTF-8 형식의 3MB 이하 .ipynb 파일을 선택하세요.",
          },
          400,
        );
      }
      if (!validNotebook(filename, notebook))
        return json(
          {
            error:
              "올바른 Jupyter Notebook 4 형식의 .ipynb 파일을 선택하세요. 최대 3MB입니다.",
          },
          400,
        );
      const submission = await uploadSubmission(
        query,
        id,
        user.id,
        filename,
        notebook,
        revision,
      );
      return submission ? json({ submission }) : conflict();
    }
    let data;
    try {
      data = await smallJson(request);
    } catch {
      return json({ error: "잘못된 요청입니다." }, 400);
    }
    if (!validRevision(data?.revision))
      return json({ error: "파일 버전을 확인해 주세요." }, 400);
    const submission = await requestFeedback(query, id, user.id, data.revision);
    return submission ? json({ submission }) : conflict();
  } catch {
    return unavailable();
  }
}
export async function PUT(request: Request, context: Context) {
  return mutate(request, context, true);
}
export async function POST(request: Request, context: Context) {
  return mutate(request, context, false);
}
export async function GET(request: Request, context: Context) {
  try {
    const user = await currentActor();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    const { id } = await context.params;
    const url = new URL(request.url);
    const owner = url.searchParams.get("owner") || user.id;
    const revision = Number(url.searchParams.get("revision"));
    if (!validProjectId(id) || !validUserId(owner) || !validRevision(revision))
      return json({ error: "잘못된 요청입니다." }, 400);
    if (owner !== user.id && !user.isAdmin)
      return json({ error: "본인의 파일만 볼 수 있습니다." }, 403);
    const limited = await requestLimit(user.id, "read");
    if (limited) return limited;
    if (!(await submissionStorageReady(query))) return unavailable();
    const notebook = await readNotebook(query, id, owner, user, revision);
    if (!notebook)
      return json(
        { error: "파일이 없거나 변경되었습니다. 페이지를 새로고침해 주세요." },
        404,
      );
    return new Response(notebook.text, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="notebook.ipynb"; filename*=UTF-8''${encodeURIComponent(notebook.filename).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16))}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return unavailable();
  }
}
