import type { Query } from "./progress-repository";
import type { Submission, ReviewSubmission } from "./submission-policy";
const fields =
  "project_id,filename,revision,status,feedback,uploaded_at,requested_at,reviewed_at";
function metadata(r: Record<string, unknown>): Submission {
  const date = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);
  return {
    projectId: String(r.project_id),
    filename: String(r.filename),
    revision: Number(r.revision),
    status: r.status as Submission["status"],
    feedback: String(r.feedback),
    uploadedAt: date(r.uploaded_at)!,
    requestedAt: date(r.requested_at),
    reviewedAt: date(r.reviewed_at),
  };
}
export async function submissionStorageReady(query: Query) {
  const [r] = await query(
    "SELECT to_regclass('public.optional_project_submissions') IS NOT NULL AS ready",
  );
  return r.ready === true;
}
export async function readOwnSubmissions(query: Query, userId: string) {
  return (
    await query(
      `SELECT ${fields} FROM optional_project_submissions WHERE user_id=$1::uuid`,
      [userId],
    )
  ).map(metadata);
}
export async function canSubmitProject(
  query: Query,
  projectId: string,
  completed: number[],
) {
  const rows = await query(
    "SELECT id FROM optional_projects WHERE id=$1 AND published=true AND week IN (SELECT jsonb_array_elements_text($2::jsonb)::smallint)",
    [projectId, JSON.stringify(completed)],
  );
  return rows.length > 0;
}
export async function uploadSubmission(
  query: Query,
  projectId: string,
  userId: string,
  filename: string,
  notebook: string,
  revision: number,
) {
  const rows =
    revision === 0
      ? await query(
          `INSERT INTO optional_project_submissions(project_id,user_id,filename,notebook_text) VALUES($1,$2::uuid,$3,$4) ON CONFLICT DO NOTHING RETURNING ${fields}`,
          [projectId, userId, filename, notebook],
        )
      : await query(
          `UPDATE optional_project_submissions SET filename=$3,notebook_text=$4,revision=revision+1,status='draft',feedback='',uploaded_at=now(),requested_at=NULL,reviewed_at=NULL,reviewer_id=NULL WHERE project_id=$1 AND user_id=$2::uuid AND revision=$5 RETURNING ${fields}`,
          [projectId, userId, filename, notebook, revision],
        );
  return rows[0] ? metadata(rows[0]) : null;
}
export async function requestFeedback(
  query: Query,
  projectId: string,
  userId: string,
  revision: number,
) {
  const rows = await query(
    `UPDATE optional_project_submissions SET status='requested',revision=revision+1,requested_at=now() WHERE project_id=$1 AND user_id=$2::uuid AND revision=$3 AND status='draft' RETURNING ${fields}`,
    [projectId, userId, revision],
  );
  return rows[0] ? metadata(rows[0]) : null;
}
export async function readReviewQueue(
  query: Query,
): Promise<ReviewSubmission[]> {
  const rows = await query(
    `SELECT ${fields
      .split(",")
      .map((f) => "s." + f)
      .join(
        ",",
      )},s.user_id,u.name,u.email,p.title,p.week FROM optional_project_submissions s JOIN app_users u ON u.id=s.user_id JOIN optional_projects p ON p.id=s.project_id WHERE s.status IN ('requested','reviewed') AND u.disabled_at IS NULL ORDER BY (s.status='requested') DESC,s.requested_at DESC`,
  );
  return rows.map((r) => ({
    ...metadata(r),
    userId: String(r.user_id),
    name: String(r.name),
    email: String(r.email),
    title: String(r.title),
    week: Number(r.week),
  }));
}
export async function saveFeedback(
  query: Query,
  projectId: string,
  userId: string,
  reviewerId: string,
  revision: number,
  feedback: string,
) {
  const rows = await query(
    `UPDATE optional_project_submissions SET feedback=$5,status='reviewed',revision=revision+1,reviewed_at=now(),reviewer_id=$3::uuid WHERE project_id=$1 AND user_id=$2::uuid AND revision=$4 AND status IN ('requested','reviewed') RETURNING ${fields}`,
    [projectId, userId, reviewerId, revision, feedback],
  );
  return rows[0] ? metadata(rows[0]) : null;
}
export async function readNotebook(
  query: Query,
  projectId: string,
  ownerId: string,
  actor: { id: string; isAdmin: boolean },
  revision: number,
) {
  if (actor.id !== ownerId && !actor.isAdmin) return null;
  const rows = await query(
    `SELECT filename,notebook_text FROM optional_project_submissions WHERE project_id=$1 AND user_id=$2::uuid AND revision=$3 AND ($4::boolean OR status IN ('requested','reviewed'))`,
    [projectId, ownerId, revision, actor.id === ownerId],
  );
  return rows[0]
    ? {
        filename: String(rows[0].filename),
        text: String(rows[0].notebook_text),
      }
    : null;
}
