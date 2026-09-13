import "server-only";
import { cache } from "react";
import { currentActor } from "./auth/actor";
import { query } from "./query";
import { accessibleWeeks } from "./course-policy";
import { lessons } from "./content";
import { defaultColabUrl, validColabUrl } from "./colab";
export const courseAccess = cache(async () => {
  const user = await currentActor();
  if (!user) return { user: null, weeks: [0, 1] };
  if (user.isAdmin) return { user, weeks: accessibleWeeks([], true) };
  const rows = await query(
    "SELECT week FROM week_unlocks WHERE user_id=$1::uuid",
    [user.id],
  );
  return { user, weeks: accessibleWeeks(rows.map((r) => Number(r.week))) };
});
export async function editedLessons() {
  const all = lessons().map((w) => ({
    ...w,
    colabUrl: defaultColabUrl(w.week),
  }));
  if (!process.env.DATABASE_URL) return all;
  const edits = await query(
    "SELECT week,body,to_jsonb(lesson_edits)->>'colab_url' AS colab_url FROM lesson_edits WHERE to_jsonb(lesson_edits)->>'content_revision'='revised-v2'",
  );
  return all.map((w) => ({
    ...w,
    body: String(edits.find((r) => Number(r.week) === w.week)?.body ?? w.body),
    colabUrl: (() => {
      const value = edits.find((r) => Number(r.week) === w.week)?.colab_url;
      return value == null ? w.colabUrl : validColabUrl(value) ? value : "";
    })(),
  }));
}
