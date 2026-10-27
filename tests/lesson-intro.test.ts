import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { validateLessonIntro, type LessonIntro } from "../lib/lesson-intro";
import {
  defaultIntro,
  mergeIntroGlossary,
  readIntroOverrides,
  saveLessonIntro,
} from "../lib/lesson-intro-repository";
import type { Query } from "../lib/progress-repository";

const intro: LessonIntro = {
  why: "기울기를 배웁니다.",
  previous: "손실과 연결합니다.",
  prerequisite: "함수",
  terms: [{ term: "Gradient", definition: "손실의 변화 방향" }],
  revision: 0,
};

test("intro validation allows hidden terms and blank descriptions; rejects malformed, duplicate and oversized drafts", () => {
  assert.deepEqual(validateLessonIntro(intro), intro);
  assert(
    validateLessonIntro({
      ...intro,
      terms: [],
      why: "",
      previous: "",
      prerequisite: "",
    }),
  );
  assert(
    validateLessonIntro({
      ...intro,
      terms: [{ term: "  Gradient  ", definition: "" }],
    }),
  );
  assert.equal(
    validateLessonIntro({
      ...intro,
      terms: [{ term: "  Gradient  ", definition: "" }],
    })!.terms[0].term,
    "Gradient",
  );
  for (const bad of [
    null,
    {},
    { ...intro, revision: -1 },
    { ...intro, revision: 0.5 },
    { ...intro, revision: Number.MAX_SAFE_INTEGER + 1 },
    { ...intro, why: 42 },
    { ...intro, prerequisite: "x".repeat(5001) },
    { ...intro, terms: [null] },
    { ...intro, terms: Array(61).fill(intro.terms[0]) },
    { ...intro, terms: [{ term: " ", definition: "" }] },
    { ...intro, terms: [{ term: "x".repeat(101), definition: "" }] },
    { ...intro, terms: [{ term: "X", definition: "x".repeat(5001) }] },
    { ...intro, terms: [{ term: "X" }] },
    {
      ...intro,
      terms: [
        { term: "Gradient", definition: "" },
        { term: " gradient ", definition: "" },
      ],
    },
  ])
    assert.equal(validateLessonIntro(bad), null);
});

test("defaults prefer the current week's definition and do not expose later weeks", () => {
  const glossary = [
    { term: "Gradient", definition: "earlier", week: 2 },
    { term: "Gradient", definition: "current", week: 4 },
    { term: "Future", definition: "locked", week: 5 },
  ];
  const result = defaultIntro(
    4,
    intro,
    ["Gradient", "Future", "Unknown"],
    glossary,
  );
  assert.deepEqual(
    result.terms.map((t) => t.definition),
    ["current", "", ""],
  );
  assert.equal(result.revision, 0);
  assert.equal(
    defaultIntro(3, intro, ["Gradient"], glossary).terms[0].definition,
    "earlier",
  );
});

test("PostgreSQL stores each intro atomically, detects conflicts, persists empty lists, and isolates weeks and completion records", async () => {
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    const query: Query = async (sql, values = []) =>
      (await db.query<Record<string, unknown>>(sql, values)).rows;
    await query(
      "INSERT INTO course_documents(name,body) VALUES('lesson-context','original context'),('glossary','original glossary')",
    );
    const itemsBefore = await query("SELECT * FROM learning_items ORDER BY id");
    assert.equal(await saveLessonIntro(query, 4, intro), 1);
    assert.equal(
      await saveLessonIntro(query, 4, { ...intro, why: "stale" }),
      null,
    );
    assert.equal(
      await saveLessonIntro(query, 3, { ...intro, why: "week three" }),
      1,
    );
    const saved = await readIntroOverrides(query, [4]);
    assert.equal(saved.size, 1);
    assert.equal(saved.get(4)?.why, intro.why);
    assert.equal(saved.get(4)?.revision, 1);
    assert.equal(
      await saveLessonIntro(query, 4, { ...intro, terms: [], revision: 1 }),
      2,
    );
    assert.equal(
      await saveLessonIntro(query, 4, { ...intro, revision: 1 }),
      null,
    );
    const updated = await readIntroOverrides(query, [3, 4]);
    assert.deepEqual(updated.get(4)?.terms, []);
    assert.equal(updated.get(3)?.why, "week three");
    const glossary = [0, 3, 4, 8].map((week) => ({
      term: "Gradient",
      definition: `week ${week}`,
      week,
    }));
    const merged = mergeIntroGlossary(glossary, updated, [0, 3, 4]);
    assert.deepEqual(
      merged.map((t) => t.week),
      [0, 3],
    );
    assert.equal(merged[0].definition, "week 0");
    assert.equal(merged[1].definition, intro.terms[0].definition);
    assert.deepEqual(
      await query("SELECT * FROM learning_items ORDER BY id"),
      itemsBefore,
    );
    assert.equal(
      (
        await query(
          "SELECT body FROM course_documents WHERE name='lesson-context'",
        )
      )[0].body,
      "original context",
    );
    assert.equal(
      (
        await query("SELECT body FROM course_documents WHERE name='glossary'")
      )[0].body,
      "original glossary",
    );
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    assert.equal((await readIntroOverrides(query, [4])).get(4)?.revision, 2);
  } finally {
    await db.close();
  }
});
