import "server-only";
import { cache } from "react";
import { currentActor } from "./auth/actor";
import { query } from "./query";
import { accessibleWeeks } from "./course-policy";
import { lessons } from "./content";
import { readCourseLessons } from "./course-repository";
import { readConceptLessons } from "./concept-repository";
import { learnerAccess } from "./unlock-repository";
import { readWeekAccessRules } from "./week-access-repository";
import type { WeekAccessRules } from "./course-policy";
export const courseCatalog = cache(() =>
  process.env.DATABASE_URL
    ? readConceptLessons(query, lessons())
    : Promise.resolve(lessons()),
);
export const courseAccessRules = cache((): Promise<WeekAccessRules> =>
  process.env.DATABASE_URL ? readWeekAccessRules(query) : Promise.resolve({}),
);
export const courseAccess = cache(async () => {
  const user = await currentActor();
  const rules = await courseAccessRules();
  if (!user)
    return { user: null, weeks: [0, 1], completed: [] as number[], rules };
  if (user.isAdmin)
    return {
      user,
      weeks: accessibleWeeks([], true),
      completed: accessibleWeeks([], true),
      rules,
    };
  return {
    user,
    rules,
    ...(await learnerAccess(query, user.id, await courseCatalog(), rules)),
  };
});
export async function editedLessons() {
  const { weeks } = await courseAccess();
  return readCourseLessons(query, await courseCatalog(), weeks);
}
