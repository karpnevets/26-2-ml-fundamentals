import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  accessibleWeeks,
  validateQuiz,
  publicQuestions,
  safeImage,
  validateWeekAccessRule,
  weekAccessRule,
} from "../lib/course-policy";
import { hashPassword, matchesPassword } from "../lib/quiz-password";
import { quizTemplate } from "../lib/quiz-templates";
import { learnerAccess, unlockWeek } from "../lib/unlock-repository";
import type { Query } from "../lib/progress-repository";
import {
  readWeekAccessRules,
  saveWeekAccessRule,
} from "../lib/week-access-repository";
import { readConceptLessons } from "../lib/concept-repository";
import { lessons } from "../lib/content";
test("saved access, safe quiz projection, publish validation and password normalization", () => {
  assert.deepEqual(accessibleWeeks([4, 3]), [0, 1, 3, 4]);
  assert.deepEqual(accessibleWeeks([2, 4]), [0, 1, 2, 4]);
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
    const draft = {
      ...template,
      questions: [
        {
          number: 1,
          description: "Test question",
          answer: "test-value",
          image: "",
        },
      ],
      instructions: "Test instructions",
      password: "123",
      published: true,
    };
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

test("per-week automatic unlock uses the chosen prerequisite and preserves grants", async () => {
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    const query: Query = async (sql, values = []) =>
      (await db.query<Record<string, unknown>>(sql, values)).rows;
    const users = await query(
      "INSERT INTO app_users(google_sub,email) VALUES('auto-a','auto-a@snu.ac.kr'),('auto-b','auto-b@snu.ac.kr') RETURNING id",
    );
    const [a, b] = users.map((user) => String(user.id));
    const catalog = await readConceptLessons(query, lessons());
    const grantThroughFive =
      "INSERT INTO week_unlocks(user_id,week) SELECT $1::uuid, generate_series(2,5)";
    const completeFive =
      "INSERT INTO learning_progress(user_id,item_id,completed) SELECT $1::uuid,id,true FROM learning_items WHERE week=5 AND kind='concept'";
    await query(grantThroughFive, [a]);
    await query(completeFive, [b]);
    const rule = { quizRequired: false, prerequisite: 5, revision: 0 };
    assert.equal(validateWeekAccessRule(5, rule), null);
    assert.equal(
      validateWeekAccessRule(8, { ...rule, quizRequired: true }),
      null,
    );
    assert.deepEqual(validateWeekAccessRule(8, rule), rule);
    assert.equal(await saveWeekAccessRule(query, 6, rule), 1);
    assert.equal(await saveWeekAccessRule(query, 8, rule), 1);
    assert.equal(await saveWeekAccessRule(query, 8, rule), null);
    let rules = await readWeekAccessRules(query);
    assert.equal(weekAccessRule(rules, 7).quizRequired, true);
    assert.deepEqual(
      (await learnerAccess(query, a, catalog, rules)).weeks,
      [0, 1, 2, 3, 4, 5],
    );
    assert.deepEqual(await learnerAccess(query, b, catalog, rules), {
      weeks: [0, 1],
      completed: [],
    });
    assert.equal((await unlockWeek(query, a, 8, "unused")).status, 404);

    await query(completeFive, [a]);
    assert.deepEqual(await learnerAccess(query, a, catalog, rules), {
      weeks: [0, 1, 2, 3, 4, 5, 6, 8],
      completed: [5],
    });
    assert.equal((await unlockWeek(query, a, 7, "unused")).status, 403);
    assert.equal(await saveWeekAccessRule(query, 7, rule), 1);
    rules = await readWeekAccessRules(query);
    assert.equal(
      (await learnerAccess(query, a, catalog, rules)).weeks.length,
      9,
    );
    assert.equal(
      await saveWeekAccessRule(query, 8, {
        quizRequired: true,
        prerequisite: 7,
        revision: 1,
      }),
      2,
    );
    assert.equal(
      await saveWeekAccessRule(query, 8, { ...rule, revision: 1 }),
      null,
    );
    await query(
      "UPDATE learning_progress SET completed=false WHERE user_id=$1::uuid",
      [a],
    );
    assert.deepEqual(
      await learnerAccess(query, a, catalog, await readWeekAccessRules(query)),
      { weeks: [0, 1, 2, 3, 4, 5, 6, 7, 8], completed: [] },
    );
    await query(grantThroughFive, [b]);
    assert.deepEqual(
      (await learnerAccess(query, b, catalog, await readWeekAccessRules(query)))
        .weeks,
      [0, 1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal((await query("SELECT * FROM quiz_attempts")).length, 0);
  } finally {
    await db.close();
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
    assert.equal(
      (await unlockWeek(query, A, 2, "test-unlock-key")).status,
      403,
    );
    await query(
      "INSERT INTO learning_progress(user_id,item_id,completed) SELECT u.id,i.id,true FROM app_users u CROSS JOIN learning_items i WHERE i.week=1 AND i.kind='concept'",
    );
    assert.equal(
      (await unlockWeek(query, A, 2, "test-unlock-key")).status,
      409,
    );
    for (const week of [2, 3])
      await query(
        "INSERT INTO week_quizzes(week,password_hash,published) VALUES($1,$2,true)",
        [week, hashPassword("test-unlock-key")],
      );
    assert.equal(
      (await unlockWeek(query, A, 3, "test-unlock-key")).status,
      403,
    );
    for (let i = 0; i < 10; i++)
      assert.equal((await unlockWeek(query, A, 2, "wrong")).status, 400);
    assert.equal(
      (await unlockWeek(query, A, 2, "test-unlock-key")).status,
      429,
    );
    assert.equal(
      (await unlockWeek(query, B, 2, "test-unlock-key")).status,
      200,
    );
    await query(
      "UPDATE quiz_attempts SET window_start=now()-interval '16 minutes' WHERE user_id=$1::uuid",
      [A],
    );
    assert.equal(
      (await unlockWeek(query, A, 2, "test-unlock-key")).status,
      200,
    );
    assert.equal(
      (await unlockWeek(query, A, 3, "test-unlock-key")).status,
      403,
    );
    assert.equal(
      (
        await query(
          "SELECT * FROM quiz_attempts WHERE user_id=$1::uuid AND week=3",
          [A],
        )
      ).length,
      0,
    );
    await query(
      "INSERT INTO learning_progress(user_id,item_id,completed) SELECT $1::uuid,id,true FROM learning_items WHERE week=2 AND kind='concept'",
      [A],
    );
    assert.equal(
      (await unlockWeek(query, A, 3, "test-unlock-key")).status,
      200,
    );
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
