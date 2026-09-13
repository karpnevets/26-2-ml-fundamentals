import type { Query } from "./progress-repository";
import { accessibleWeeks } from "./course-policy";
import { matchesPassword } from "./quiz-password";
export async function unlockWeek(
  query: Query,
  userId: string,
  week: number,
  password: string,
  admin = false,
) {
  const rows = await query(
    "SELECT week FROM week_unlocks WHERE user_id=$1::uuid",
    [userId],
  );
  const weeks = accessibleWeeks(
    rows.map((r) => Number(r.week)),
    admin,
  );
  if (!weeks.includes(week - 1))
    return { error: "직전 주차를 먼저 열어 주세요.", status: 403 };
  if (weeks.includes(week)) return { ok: true, status: 200 };
  const [quiz] = await query(
    "SELECT password_hash FROM week_quizzes WHERE week=$1 AND published=true",
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
