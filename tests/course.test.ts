import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  accessibleWeeks,
  validateQuiz,
  publicQuestions,
  safeImage,
} from "../lib/course-policy";
import { hashPassword, matchesPassword } from "../lib/quiz-password";
import { quizTemplate } from "../lib/quiz-templates";
import { unlockWeek } from "../lib/unlock-repository";
import type { Query } from "../lib/progress-repository";
test("sequential access, safe quiz projection, publish validation and password normalization", () => {
  assert.deepEqual(accessibleWeeks([4, 3]), [0, 1]);
  assert.deepEqual(accessibleWeeks([2, 4]), [0, 1, 2]);
  assert.equal(accessibleWeeks([], true).length, 9);
  const hash = hashPassword("Ab12");
  assert(matchesPassword(" Ab１２ ", hash));
  assert(!matchesPassword("ab12", hash));
  assert(!matchesPassword("Ab 12", hash));
  assert.notEqual(hashPassword("Ab12"), hash);
  assert(!safeImage("javascript:alert(1)"));
  assert(!safeImage("http://example.com/a.png"));
  assert(safeImage("https://example.com/a.png"));
  for (let week = 2; week <= 8; week++) {
    const template = quizTemplate(week);
    const draft = { ...template, password: "123", published: true };
    assert(validateQuiz(draft));
    assert(
      !validateQuiz({
        ...draft,
        questions: [draft.questions[0], draft.questions[0]],
      }),
    );
    assert(!validateQuiz({ ...draft, questions: [] }));
    assert(
      !JSON.stringify(publicQuestions(draft.questions)).includes("answer"),
    );
  }
});
test("real PostgreSQL unlock isolation, order, rate limit, cooldown, persistence and migration rerun", async () => {
  const db = new PGlite();
  try {
    const schema = fs.readFileSync("db/setup.sql", "utf8");
    await db.exec(schema);
    await db.exec(schema);
    const query: Query = async (sql, values = []) =>
      (await db.query<Record<string, unknown>>(sql, values)).rows;
    const [a] = await query(
      "INSERT INTO app_users(google_sub,email,name) VALUES('quiz-a','quiz-a@snu.ac.kr','A') RETURNING id",
    );
    const [b] = await query(
      "INSERT INTO app_users(google_sub,email,name) VALUES('quiz-b','quiz-b@snu.ac.kr','B') RETURNING id",
    );
    const A = String(a.id),
      B = String(b.id);
    assert.equal((await unlockWeek(query, A, 2, "64")).status, 409);
    for (const week of [2, 3])
      await query(
        "INSERT INTO week_quizzes(week,password_hash,published) VALUES($1,$2,true)",
        [week, hashPassword("64")],
      );
    assert.equal((await unlockWeek(query, A, 3, "64")).status, 403);
    for (let i = 0; i < 10; i++)
      assert.equal((await unlockWeek(query, A, 2, "wrong")).status, 400);
    assert.equal((await unlockWeek(query, A, 2, "64")).status, 429);
    assert.equal((await unlockWeek(query, B, 2, "64")).status, 200);
    await query(
      "UPDATE quiz_attempts SET window_start=now()-interval '16 minutes' WHERE user_id=$1::uuid",
      [A],
    );
    assert.equal((await unlockWeek(query, A, 2, "64")).status, 200);
    assert.equal((await unlockWeek(query, A, 3, "64")).status, 200);
    await query("UPDATE week_quizzes SET published=false");
    assert.equal((await unlockWeek(query, A, 3, "anything")).status, 200);
    await db.exec(schema);
    assert.equal(
      (await query("SELECT * FROM week_unlocks WHERE user_id=$1::uuid", [A]))
        .length,
      2,
    );
    await query("DELETE FROM app_users WHERE id=$1::uuid", [A]);
    assert.equal(
      (await query("SELECT * FROM week_unlocks WHERE user_id=$1::uuid", [A]))
        .length,
      0,
    );
    assert.equal(
      (await query("SELECT * FROM week_unlocks WHERE user_id=$1::uuid", [B]))
        .length,
      1,
    );
  } finally {
    await db.close();
  }
});
