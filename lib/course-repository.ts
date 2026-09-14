import type { Query } from "./progress-repository";
import type { Lesson } from "./content";
import { defaultColabUrl, validColabUrl } from "./colab";

// The caller supplies the server-authorized weeks, never a browser input.
export async function readCourseLessons(
  query: Query,
  catalog: Lesson[],
  weeks: number[],
) {
  const rows = await query(
    `SELECT o.week,COALESCE(e.body,o.body) AS body,e.colab_url
     FROM course_originals o LEFT JOIN lesson_edits e ON e.week=o.week AND e.content_revision='revised-v2'
     WHERE o.week IN (SELECT jsonb_array_elements_text($1::jsonb)::smallint)`,
    [JSON.stringify(weeks)],
  );
  return catalog.map((w) => {
    if (!weeks.includes(w.week)) return { ...w, body: "", colabUrl: "" };
    const row = rows.find((r) => Number(r.week) === w.week);
    if (!row)
      throw new Error("Course originals have not been imported into DB");
    return {
      ...w,
      body: String(row.body),
      colabUrl:
        row.colab_url == null
          ? defaultColabUrl(w.week)
          : validColabUrl(row.colab_url)
            ? row.colab_url
            : "",
    };
  });
}
