import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { revisedLocalProgress } from "../lib/progress-policy";

test("revised curriculum migrates existing records once, archives edits and preserves unlocks", async () => {
  const db = new PGlite();
  try {
    for (const file of [
      "001_learning_progress.sql",
      "002_course_editor.sql",
      "003_colab_links.sql",
    ]) {
      const actual = fs
        .readdirSync("db/migrations")
        .find((f) => f.startsWith(file.slice(0, 3)))!;
      await db.exec(fs.readFileSync("db/migrations/" + actual, "utf8"));
    }
    await db.exec(`
   INSERT INTO app_users(id,google_sub,email) VALUES('00000000-0000-0000-0000-000000000001','old','old@snu.ac.kr');
   INSERT INTO learning_items VALUES ('w2:Gradient',2,'concept','Gradient'),('w3:Vector',3,'concept','Vector'),('w4:Feature Space',4,'concept','Feature Space'),('w2:assignment:Check',2,'assignment','Check');
   INSERT INTO learning_progress SELECT '00000000-0000-0000-0000-000000000001',id,true,now() FROM learning_items;
   INSERT INTO week_unlocks VALUES('00000000-0000-0000-0000-000000000001',2,now());
   INSERT INTO lesson_edits(week,body,colab_url) VALUES(2,'old custom body','https://colab.research.google.com/drive/custom');
   INSERT INTO week_quizzes(week,questions,password_hash,published) VALUES(3,'[]','old-gradient-password',true),(4,'[]','old-vector-password',true),(5,'[]','old-feature-password',true),(2,'[]','model-password',true);
  `);
    const setup = fs.readFileSync("db/setup.sql", "utf8");
    await db.exec(setup);
    const progress = (
      await db.query<{ item_id: string }>(
        "SELECT item_id FROM learning_progress ORDER BY item_id",
      )
    ).rows.map((r) => r.item_id);
    assert.deepEqual(progress, [
      "w2:Vector",
      "w3:Feature Space",
      "w4:Gradient",
    ]);
    assert.equal((await db.query("SELECT * FROM week_unlocks")).rows.length, 1);
    assert.equal((await db.query("SELECT * FROM lesson_edits")).rows.length, 0);
    const quizzes = (
      await db.query<{
        week: number;
        password_hash: string;
        published: boolean;
      }>("SELECT week,password_hash,published FROM week_quizzes ORDER BY week")
    ).rows;
    assert.deepEqual(
      quizzes.map((q) => [q.week, q.password_hash, q.published]),
      [
        [2, "model-password", true],
        [3, "old-vector-password", false],
        [4, "old-feature-password", false],
        [5, "old-gradient-password", false],
      ],
    );
    assert.equal(
      (await db.query("SELECT * FROM curriculum_progress_archive")).rows.length,
      4,
    );
    const archive = (
      await db.query<{ data: { body: string; colab_url: string }[] }>(
        "SELECT data FROM curriculum_content_archive WHERE kind='lessons'",
      )
    ).rows[0].data;
    assert.equal(archive[0].body, "old custom body");
    assert(archive[0].colab_url.includes("/custom"));
    await db.exec(
      "INSERT INTO lesson_edits(week,body) VALUES(2,'new custom body'); UPDATE week_quizzes SET published=true WHERE week=3;",
    );
    await db.exec(setup);
    assert.equal(
      (await db.query<{ body: string }>("SELECT body FROM lesson_edits"))
        .rows[0].body,
      "new custom body",
    );
    assert.equal(
      (
        await db.query<{ published: boolean }>(
          "SELECT published FROM week_quizzes WHERE week=3",
        )
      ).rows[0].published,
      true,
    );
    assert.deepEqual(
      (
        await db.query<{ item_id: string }>(
          "SELECT item_id FROM learning_progress ORDER BY item_id",
        )
      ).rows.map((r) => r.item_id),
      progress,
    );
  } finally {
    await db.close();
  }
});

test("local progress moves concept weeks and does not reuse old assignment completion", () => {
  assert.deepEqual(
    revisedLocalProgress({
      "w2:Gradient": true,
      "w3:Vector": false,
      "w4:Feature Space": true,
      "w1:Model": true,
      "w2:assignment:Check": true,
    }),
    {
      "w4:Gradient": true,
      "w2:Vector": false,
      "w3:Feature Space": true,
      "w1:Model": true,
    },
  );
});
