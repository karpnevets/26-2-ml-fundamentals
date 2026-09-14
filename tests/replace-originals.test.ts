import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import { PGlite } from "@electric-sql/pglite";

const file = ".private-course/replace-week-1-8-latex-v2.sql";
test(
  "replacement archives originals and edits, preserves zero/Colab/quizzes and runs once",
  { skip: !fs.existsSync(file) },
  async () => {
    const db = new PGlite();
    try {
      await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
      await db.exec(
        "INSERT INTO course_originals(week,body) VALUES(0,'zero'),(1,'old original'); INSERT INTO lesson_edits(week,body,colab_url) VALUES(1,'old edit','https://colab.research.google.com/drive/custom'); INSERT INTO week_quizzes(week,instructions) VALUES(2,'keep quiz');",
      );
      const sql = fs.readFileSync(file, "utf8");
      await db.exec(sql);
      const rows = (
        await db.query<{ week: number; body: string }>(
          "SELECT week,body FROM course_originals ORDER BY week",
        )
      ).rows;
      assert.equal(rows.length, 9);
      assert.equal(rows[0].body, "zero");
      for (let week = 1; week <= 8; week++) {
        const name = fs
          .readdirSync("content")
          .find((f) => f.startsWith(`week-${week}-`))!;
        assert.equal(
          rows[week].body,
          matter(fs.readFileSync(`content/${name}`, "utf8")).content,
        );
      }
      const edit = (
        await db.query<{ body: string; colab_url: string }>(
          "SELECT body,colab_url FROM lesson_edits WHERE week=1",
        )
      ).rows[0];
      assert.equal(edit.body, rows[1].body);
      assert.equal(
        edit.colab_url,
        "https://colab.research.google.com/drive/custom",
      );
      assert.equal(
        (
          await db.query<{ instructions: string }>(
            "SELECT instructions FROM week_quizzes WHERE week=2",
          )
        ).rows[0].instructions,
        "keep quiz",
      );
      assert.equal(
        (
          await db.query(
            "SELECT * FROM curriculum_content_archive WHERE revision='week-1-8-latex-v2'",
          )
        ).rows.length,
        2,
      );
      await db.exec("UPDATE lesson_edits SET body='later edit' WHERE week=1");
      await db.exec(sql);
      assert.equal(
        (
          await db.query<{ body: string }>(
            "SELECT body FROM lesson_edits WHERE week=1",
          )
        ).rows[0].body,
        "later edit",
      );
    } finally {
      await db.close();
    }
  },
);
