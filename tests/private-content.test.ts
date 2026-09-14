import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { readCourseLessons } from "../lib/course-repository";
import { lessons } from "../lib/content";
import type { Query } from "../lib/progress-repository";

test("course bodies are DB-only, scoped to granted weeks, and missing originals fail closed", async () => {
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    const query: Query = async (sql, values = []) =>
      (await db.query<Record<string, unknown>>(sql, values)).rows;
    await assert.rejects(readCourseLessons(query, lessons(), [0, 1]));
    await db.exec(
      "INSERT INTO course_originals(week,body) VALUES(0,'DB zero'),(1,'DB one'),(2,'hidden DB body'); INSERT INTO lesson_edits(week,body,colab_url) VALUES(1,'edited DB one','');",
    );
    const result = await readCourseLessons(query, lessons(), [0, 1]);
    assert.equal(result[0].body, "DB zero");
    assert.equal(result[1].body, "edited DB one");
    assert.equal(result[1].colabUrl, "");
    assert.equal(result[2].body, "");
    assert(!JSON.stringify(result).includes("hidden DB body"));
    assert(lessons().every((w) => w.body === ""));
    await assert.rejects(
      readCourseLessons(
        async () => {
          throw Error("offline");
        },
        lessons(),
        [0],
      ),
    );
  } finally {
    await db.close();
  }
});

test(
  "private SQL preserves operator quizzes and other edits, replaces week zero once and backs it up",
  { skip: !fs.existsSync(".private-course/import-content.sql") },
  async () => {
    const db = new PGlite();
    try {
      await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
      await db.exec(
        "INSERT INTO lesson_edits(week,body,colab_url) VALUES(0,'previous zero','https://colab.research.google.com/drive/operator'),(1,'operator week one',NULL); INSERT INTO week_quizzes(week,questions,instructions,password_hash,published) VALUES(2,'[]','operator instructions','operator hash',true);",
      );
      const sql = fs.readFileSync(".private-course/import-content.sql", "utf8");
      await db.exec(sql);
      const original = (
        await db.query<{ body: string }>(
          "SELECT body FROM course_originals WHERE week=0",
        )
      ).rows[0].body;
      assert.equal(
        original.trim(),
        fs.readFileSync(".private-course/week-0-original.md", "utf8").trim(),
      );
      const zero = (
        await db.query<{ body: string; colab_url: string }>(
          "SELECT body,colab_url FROM lesson_edits WHERE week=0",
        )
      ).rows[0];
      assert.equal(zero.body, original);
      assert.equal(
        zero.colab_url,
        "https://colab.research.google.com/drive/operator",
      );
      assert.equal(
        (
          await db.query<{ body: string }>(
            "SELECT body FROM lesson_edits WHERE week=1",
          )
        ).rows[0].body,
        "operator week one",
      );
      const quiz = (
        await db.query<{ password_hash: string; published: boolean }>(
          "SELECT password_hash,published FROM week_quizzes WHERE week=2",
        )
      ).rows[0];
      assert.equal(quiz.password_hash, "operator hash");
      assert.equal(quiz.published, true);
      assert.equal(
        (await db.query("SELECT * FROM course_originals")).rows.length,
        9,
      );
      const backup = (
        await db.query<{ data: { body: string }[] }>(
          "SELECT data FROM curriculum_content_archive WHERE revision='private-content-v1'",
        )
      ).rows[0].data;
      assert.equal(backup[0].body, "previous zero");
      await db.exec(
        "UPDATE lesson_edits SET body='subsequent edit' WHERE week=0;",
      );
      await db.exec(sql);
      assert.equal(
        (
          await db.query<{ body: string }>(
            "SELECT body FROM lesson_edits WHERE week=0",
          )
        ).rows[0].body,
        "subsequent edit",
      );
    } finally {
      await db.close();
    }
  },
);
