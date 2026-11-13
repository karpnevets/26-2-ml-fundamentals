import type { Query } from "./progress-repository";
import {
  accessibleWeeks,
  weekAccessRule,
  type WeekAccessRules,
} from "./course-policy";
import { matchesPassword } from "./quiz-password";
import { readProgress } from "./progress-repository";
import { completedWeeks } from "./completion";
import { lessons } from "./content";
import { readConceptLessons } from "./concept-repository";
import type { ConceptWeek } from "./concepts";
import { readWeekAccessRules } from "./week-access-repository";

async function readUnlockedWeeks(query: Query, userId: string) {
  const rows = await query(
    "SELECT week FROM week_unlocks WHERE user_id=$1::uuid",
    [userId],
  );
  return rows.map((row) => Number(row.week));
}

export async function learnerAccess(
  query: Query,
  userId: string,
  catalog: ConceptWeek[],
  rules: WeekAccessRules,
) {
  const unlocked = await readUnlockedWeeks(query, userId);
  const weeks = accessibleWeeks(unlocked);
  const completed = completedWeeks(await readProgress(query, userId), catalog);
  const autoUnlocked: number[] = [];
  for (let week = 2; week <= 8; week++) {
    const rule = weekAccessRule(rules, week);
    if (
      !rule.quizRequired &&
      !weeks.includes(week) &&
      weeks.includes(rule.prerequisite) &&
      completed.includes(rule.prerequisite)
    ) {
      weeks.push(week);
      autoUnlocked.push(week);
    }
  }
  if (autoUnlocked.length) {
    await query(
      "INSERT INTO week_unlocks(user_id,week) SELECT $1::uuid, unnest($2::int[]) ON CONFLICT DO NOTHING",
      [userId, autoUnlocked],
    );
  }
  return {
    weeks: accessibleWeeks(weeks),
    completed: completed.filter((week) => weeks.includes(week)),
  };
}

export async function unlockWeek(
  query: Query,
  userId: string,
  week: number,
  password: string,
  admin = false,
) {
  const rules = await readWeekAccessRules(query);
  const rule = weekAccessRule(rules, week);
  if (!rule.quizRequired)
    return { error: "해금 퀴즈가 없는 주차입니다.", status: 404 };
  const { weeks, completed } = admin
    ? { weeks: accessibleWeeks([], true), completed: [] }
    : await learnerAccess(
        query,
        userId,
        await readConceptLessons(query, lessons()),
        rules,
      );
  if (weeks.includes(week)) return { ok: true, status: 200 };
  if (!weeks.includes(rule.prerequisite))
    return { error: "직전 주차를 먼저 열어 주세요.", status: 403 };
  if (!completed.includes(rule.prerequisite))
    return {
      error: "직전 주차의 개념 체크를 모두 완료한 뒤 암호를 입력해 주세요.",
      status: 403,
    };
  const [quiz] = await query(
    "SELECT password_hash FROM week_quizzes WHERE to_jsonb(week_quizzes)->>'content_revision'='revised-v2' AND week=$1 AND published=true",
    [week],
  );
  if (!quiz)
    return {
      error: "퀴즈를 준비 중입니다. 운영자에게 문의하세요.",
      status: 409,
    };
  const [attempt] = await query(
    `INSERT INTO quiz_attempts(user_id,week) VALUES($1::uuid,$2)
    ON CONFLICT(user_id,week) DO UPDATE SET
    attempts=CASE WHEN quiz_attempts.window_start < now()-interval '15 minutes' THEN 1 ELSE quiz_attempts.attempts+1 END,
    window_start=CASE WHEN quiz_attempts.window_start < now()-interval '15 minutes' THEN now() ELSE quiz_attempts.window_start END
    RETURNING attempts`,
    [userId, week],
  );
  if (Number(attempt.attempts) > 10)
    return {
      error: "시도 횟수를 초과했습니다. 15분 후 다시 시도하세요.",
      status: 429,
    };
  if (!matchesPassword(password, String(quiz.password_hash)))
    return {
      error: "암호가 맞지 않습니다. 힌트의 조합 규칙을 확인하세요.",
      status: 400,
    };
  await query(
    "INSERT INTO week_unlocks(user_id,week) VALUES($1::uuid,$2) ON CONFLICT DO NOTHING",
    [userId, week],
  );
  return { ok: true, status: 200 };
}
