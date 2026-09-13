import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  readProgress,
  writeProgress,
  importProgress,
  dashboardRows,
  type Query,
} from "../lib/progress-repository";
import { summarizeLearners, learnersCsv, csvCell } from "../lib/admin-summary";
import type { LearningItem } from "../lib/learning-items";
test("PostgreSQL migration, isolation, upsert, safe import and admin counts", async () => {
  const db = new PGlite();
  try {
    const setup = fs.readFileSync("db/setup.sql", "utf8");
    await db.exec(setup);
    await db.exec(setup);
    const query: Query = async (text, values = []) => {
      const result = await db.query<Record<string, unknown>>(text, values);
      return result.rows;
    };
    const [a] = await query(
      `INSERT INTO app_users(google_sub,email,name) VALUES('a','a@snu.ac.kr','=HYPERLINK("evil")') RETURNING id`,
    );
    const [b] = await query(
      `INSERT INTO app_users(google_sub,email,name) VALUES('b','b@snu.ac.kr','Second') RETURNING id`,
    );
    const A = String(a.id),
      B = String(b.id);
    await writeProgress(query, A, "w1:Model", true);
    assert.deepEqual(await readProgress(query, B), {});
    await writeProgress(query, A, "w1:Model", false);
    assert.equal(
      await importProgress(query, A, ["w1:Model", "w1:Parameter"]),
      1,
    );
    assert.deepEqual(await readProgress(query, A), {
      "w1:Model": false,
      "w1:Parameter": true,
    });
    assert.equal(
      await importProgress(query, A, ["w1:Model", "w1:Parameter"]),
      0,
    );
    await assert.rejects(writeProgress(query, A, "w99:Injected", true));
    await assert.rejects(
      query(
        `INSERT INTO app_users(google_sub,email) VALUES('evil','a@gmail.com')`,
      ),
    );
    await assert.rejects(
      query(
        `INSERT INTO app_users(google_sub,email) VALUES('duplicate','a@snu.ac.kr')`,
      ),
    );
    const items = (await query(
      "SELECT id,week,kind,label FROM learning_items",
    )) as unknown as LearningItem[];
    for (const item of items.filter(
      (i) => i.week === 1 && i.kind === "concept",
    ))
      await writeProgress(query, A, item.id, true);
    await writeProgress(query, A, "w0:Python", true);
    await writeProgress(query, A, "w1:assignment:Explore", true);
    const learners = summarizeLearners(await dashboardRows(query), items);
    const first = learners.find((u) => u.id === A)!;
    assert.equal(first.completedWeeks, 1);
    assert.equal(first.completedConcepts, 7);
    assert.equal(first.assignments.Explore, 1);
    assert.equal(learners.find((u) => u.id === B)!.percent, 0);
    assert(learnersCsv(learners).includes("'=HYPERLINK"));
    assert.equal(csvCell("normal"), '"normal"');
    await query("UPDATE app_users SET disabled_at=now() WHERE id=$1::uuid", [
      B,
    ]);
    assert.equal((await dashboardRows(query)).length, 1);
    await query("DELETE FROM app_users WHERE id=$1::uuid", [A]);
    assert.deepEqual(await readProgress(query, A), {});
  } finally {
    await db.close();
  }
});
