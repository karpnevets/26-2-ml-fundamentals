import "server-only";
import { cache } from "react";
import { currentActor } from "./auth/actor";
import { query } from "./query";
import { accessibleWeeks } from "./course-policy";
import { lessons } from "./content";
import { readCourseLessons } from "./course-repository";
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
  const { weeks } = await courseAccess();
  return readCourseLessons(query, lessons(), weeks);
}
