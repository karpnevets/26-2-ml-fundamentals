import type { Query } from "./progress-repository";
import type { Project } from "./project-policy";
export async function readProjects(
  query: Query,
  completed: number[],
  admin = false,
): Promise<Project[]> {
  const rows = admin
    ? await query(
        "SELECT id,week,title,summary,body,published,revision FROM optional_projects ORDER BY week,id",
      )
    : await query(
        `SELECT id,week,title,published,revision,
        CASE WHEN week IN (SELECT jsonb_array_elements_text($1::jsonb)::smallint) THEN summary ELSE '' END AS summary,
        CASE WHEN week IN (SELECT jsonb_array_elements_text($1::jsonb)::smallint) THEN body ELSE '' END AS body
        FROM optional_projects WHERE published=true ORDER BY week,id`,
        [JSON.stringify(completed)],
      );
  return rows.map((r) => ({
    id: String(r.id),
    week: Number(r.week),
    title: String(r.title),
    summary: String(r.summary),
    body: String(r.body),
    published: r.published === true,
    revision: Number(r.revision),
  }));
}
export async function saveProject(
  query: Query,
  id: string,
  draft: Omit<Project, "id">,
) {
  const rows = await query(
    `UPDATE optional_projects SET week=$2,title=$3,summary=$4,body=$5,published=$6,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$7 RETURNING revision`,
    [
      id,
      draft.week,
      draft.title,
      draft.summary,
      draft.body,
      draft.published,
      draft.revision,
    ],
  );
  return rows.length ? Number(rows[0].revision) : null;
}
