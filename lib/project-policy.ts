export type Project = {
  id: string;
  week: number;
  title: string;
  summary: string;
  body: string;
  published: boolean;
  revision: number;
};
export const validProjectId = (id: string) => /^[a-z0-9-]{1,80}$/.test(id);
export function validateProject(value: unknown): Omit<Project, "id"> | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Project;
  if (
    !Number.isInteger(v.week) ||
    v.week < 1 ||
    v.week > 8 ||
    typeof v.title !== "string" ||
    !v.title.trim() ||
    v.title.length > 200 ||
    typeof v.summary !== "string" ||
    v.summary.length > 1000 ||
    typeof v.body !== "string" ||
    v.body.length > 100000 ||
    typeof v.published !== "boolean" ||
    !Number.isInteger(v.revision) ||
    v.revision < 1 ||
    (v.published && !v.body.trim())
  )
    return null;
  return {
    week: v.week,
    title: v.title.trim(),
    summary: v.summary,
    body: v.body,
    published: v.published,
    revision: v.revision,
  };
}
