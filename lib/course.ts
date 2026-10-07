import "server-only";
import { cache } from "react";
import { currentActor } from "./auth/actor";
import { query } from "./query";
import { accessibleWeeks } from "./course-policy";
import { lessons } from "./content";
import { readCourseLessons } from "./course-repository";
import { readProgress } from "./progress-repository";
import { completedWeeks } from "./completion";
import { readConceptLessons } from "./concept-repository";
export const courseCatalog = cache(() =>
  process.env.DATABASE_URL
    ? readConceptLessons(query, lessons())
    : Promise.resolve(lessons()),
);
export const courseAccess = cache(async () => {
  const user = await currentActor();
  if (!user) return { user: null, weeks: [0, 1], completed: [] as number[] };
  if (user.isAdmin)
    return {
      user,
      weeks: accessibleWeeks([], true),
      completed: accessibleWeeks([], true),
    };
  const rows = await query(
    "SELECT week FROM week_unlocks WHERE user_id=$1::uuid",
    [user.id],
  );
  const weeks = accessibleWeeks(rows.map((r) => Number(r.week)));
  const completed = completedWeeks(
    await readProgress(query, user.id),
    await courseCatalog(),
  ).filter((w) => weeks.includes(w));
  return { user, weeks, completed };
});
export async function editedLessons() {
  const { weeks } = await courseAccess();
  return readCourseLessons(query, await courseCatalog(), weeks);
}
