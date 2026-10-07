import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { lessons } from "../lib/content";
import { conceptEntries, validateConceptDraft } from "../lib/concepts";
import { readConceptLessons, saveConcepts } from "../lib/concept-repository";
import {
  readProgress,
  writeProgress,
  dashboardRows,
  type Query,
} from "../lib/progress-repository";
import { learningItems } from "../lib/learning-items";
import { completedWeeks } from "../lib/completion";
import { nextLearning } from "../lib/continue-learning";
import { summarizeLearners } from "../lib/admin-summary";
import { unlockWeek } from "../lib/unlock-repository";
import { hashPassword } from "../lib/quiz-password";

test("concept drafts reject empty, duplicate, oversized and foreign IDs; labels stay plain text", () => {
  const existing = [{ id: "w3:Feature Space", label: "Feature Space" }];
  const draft = {
    revision: 0,
    concepts: [
      { id: existing[0].id, label: "  특징 공간  " },
      { id: null, label: "PSD" },
    ],
  };
  assert.equal(
    validateConceptDraft(draft, existing)!.concepts[0].label,
    "특징 공간",
  );
  for (const concepts of [
    [],
    [{ id: null, label: " " }],
    [{ id: null, label: "a".repeat(101) }],
    [{ id: "w2:Vector", label: "Vector" }],
    [existing[0], existing[0]],
    [
      { id: null, label: "PSD" },
      { id: null, label: "psd" },
    ],
    Array.from({ length: 61 }, (_, i) => ({ id: null, label: String(i) })),
  ]) {
    assert.equal(validateConceptDraft({ ...draft, concepts }, existing), null);
  }
  assert.equal(
    validateConceptDraft({ ...draft, revision: -1 }, existing),
    null,
  );
  assert.equal(
    validateConceptDraft({ ...draft, revision: 0.5 }, existing),
    null,
  );
  assert.equal(
    validateConceptDraft(
      { ...draft, concepts: [{ label: "Missing ID" }] },
      existing,
    ),
    null,
  );
  assert(
    validateConceptDraft(
      {
        ...draft,
        concepts: [{ id: null, label: "<script>plain text</script>" }],
      },
      existing,
    ),
  );
});

test("persisted concept edits preserve history, use stable IDs, reject stale saves and update completion/unlock/dashboard", async () => {
  const db = new PGlite();
  const query: Query = async (sql, args = []) =>
    (await db.query<Record<string, unknown>>(sql, args)).rows;
  try {
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    const catalog = await readConceptLessons(query, lessons());
    assert.deepEqual(catalog[1].concepts, lessons()[1].concepts);
    assert.equal(catalog[1].conceptRevision, 0);
    const old = conceptEntries(catalog[1]);
    const [user] = await query(
      "INSERT INTO app_users(google_sub,email) VALUES('concept-user','concept-user@snu.ac.kr') RETURNING id",
    );
    const userId = String(user.id);
    for (const c of old) await writeProgress(query, userId, c.id, true);
    const first = await saveConcepts(query, 1, {
      revision: 0,
      concepts: [
        { id: old[0].id, label: "모델" },
        { id: null, label: "새 개념" },
      ],
    });
    assert(first);
    assert.equal(first.revision, 1);
    assert.equal(first.concepts[0].id, old[0].id);
    assert.match(first.concepts[1].id, /^w1:concept:/);
    assert.equal(
      await saveConcepts(query, 1, { revision: 0, concepts: old }),
      null,
    );
    let saved = await readConceptLessons(query, lessons());
    let values = await readProgress(query, userId);
    assert.equal(values[old[0].id], true);
    assert.equal(values[old[1].id], true); // Removed history is retained.
    assert(!completedWeeks(values, saved).includes(1));
    assert.equal(nextLearning(saved, values).href, "/week/1");
    const newId = first.concepts[1].id;
    assert.equal(
      (
        await query("SELECT label FROM learning_items WHERE id=$1", [old[0].id])
      )[0].label,
      "모델",
    );
    await query(
      "INSERT INTO week_quizzes(week,password_hash,published) VALUES(2,$1,true)",
      [hashPassword("concept-key")],
    );
    assert.equal(
      (await unlockWeek(query, userId, 2, "concept-key")).status,
      403,
    );
    await writeProgress(query, userId, newId, true);
    values = await readProgress(query, userId);
    assert(completedWeeks(values, saved).includes(1));
    assert.equal(
      (await unlockWeek(query, userId, 2, "concept-key")).status,
      200,
    );
    const second = await saveConcepts(query, 1, {
      revision: 1,
      concepts: [first.concepts[1], { id: old[0].id, label: "Model renamed" }],
    });
    assert(second);
    assert.equal(second.concepts[1].id, old[0].id);
    assert.equal(
      await saveConcepts(query, 1, { revision: 1, concepts: first.concepts }),
      null,
    );
    saved = await readConceptLessons(query, lessons());
    assert.deepEqual(saved[1].concepts, ["새 개념", "Model renamed"]);
    assert(
      completedWeeks(await readProgress(query, userId), saved).includes(1),
    );
    const summary = summarizeLearners(
      await dashboardRows(query),
      learningItems(saved),
    )[0];
    assert.equal(summary.weeks[0].done, 2);
    assert.equal(summary.weeks[0].total, 2);
    const third = await saveConcepts(query, 1, {
      revision: 2,
      concepts: [second.concepts[1], { id: null, label: "새 개념" }],
    });
    assert(third);
    assert.notEqual(third.concepts[1].id, newId); // Re-adding starts unchecked.
    assert.equal((await readProgress(query, userId))[newId], true);
    assert(
      !completedWeeks(
        await readProgress(query, userId),
        await readConceptLessons(query, lessons()),
      ).includes(1),
    );
    assert.equal(
      (await unlockWeek(query, userId, 2, "concept-key")).status,
      200,
    ); // Existing unlocks stay open.
    await db.exec(
      `CREATE FUNCTION reject_concept_insert() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'test storage failure'; END $$ LANGUAGE plpgsql; CREATE TRIGGER reject_concept_insert BEFORE INSERT ON learning_items FOR EACH ROW EXECUTE FUNCTION reject_concept_insert();`,
    );
    await assert.rejects(
      saveConcepts(query, 1, {
        revision: 3,
        concepts: [{ id: null, label: "Failed save" }],
      }),
    );
    const unchanged = (await readConceptLessons(query, lessons()))[1];
    assert.equal(unchanged.conceptRevision, 3);
    assert.deepEqual(unchanged.concepts, ["Model renamed", "새 개념"]);
  } finally {
    await db.close();
  }
});
