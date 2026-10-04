import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { readProjects, saveProject } from "../lib/project-repository";
import { validateProject } from "../lib/project-policy";
import { completedWeeks } from "../lib/completion";
import { lessons } from "../lib/content";
import type { Query } from "../lib/progress-repository";

test("completion requires every current concept; assignments and partial progress do not qualify", () => {
  const concepts = lessons().find((w) => w.week === 1)!.concepts;
  const progress = Object.fromEntries(concepts.map((c) => [`w1:${c}`, true]));
  assert(completedWeeks(progress).includes(1));
  progress[`w1:${concepts[0]}`] = false;
  progress["w1:assignment:Check"] = true;
  assert(!completedWeeks(progress).includes(1));
  assert.deepEqual(completedWeeks({ "w1:obsolete": true }), []);
});

test("projects: unpublished data never leaves DB for students, locked body is withheld, edits conflict safely", async () => {
  const db = new PGlite();
  const query: Query = async (sql, args = []) =>
    (await db.query<Record<string, unknown>>(sql, args)).rows;
  try {
    const schema = fs.readFileSync(
      "db/migrations/007_optional_projects.sql",
      "utf8",
    );
    await db.exec(schema);
    await db.exec(schema);
    await query(
      "INSERT INTO optional_projects(id,week,title,summary,body,published) VALUES ('draft',3,'Private title','Private summary','Private body',false),('open',3,'Public project','Eligible summary','Eligible body',true)",
    );
    const guest = await readProjects(query, []);
    assert.equal(guest.length, 1);
    assert.equal(guest[0].body, "");
    assert.equal(guest[0].summary, "");
    assert(!JSON.stringify(guest).includes("Private"));
    assert.equal((await readProjects(query, [2]))[0].body, "");
    assert.equal((await readProjects(query, [3]))[0].body, "Eligible body");
    const admin = await readProjects(query, [], true);
    const draft = admin.find((p) => p.id === "draft")!;
    assert.equal(draft.body, "Private body");
    assert(validateProject(draft));
    assert(!validateProject({ ...draft, week: 9 }));
    assert(!validateProject({ ...draft, body: "", published: true }));
    assert.equal(
      await saveProject(query, "draft", {
        ...draft,
        body: "Edited private body",
      }),
      2,
    );
    assert.equal(
      await saveProject(query, "draft", { ...draft, body: "Stale overwrite" }),
      null,
    );
    assert(
      !JSON.stringify(await readProjects(query, [3])).includes(
        "Edited private",
      ),
    );
    await saveProject(query, "draft", {
      ...draft,
      body: "Published body",
      published: true,
      revision: 2,
    });
    assert.equal(
      (await readProjects(query, [3])).find((p) => p.id === "draft")!.body,
      "Published body",
    );
    assert.equal(
      (await readProjects(query, [])).find((p) => p.id === "draft")!.body,
      "",
    );
    await saveProject(query, "draft", {
      ...draft,
      published: false,
      revision: 3,
    });
    assert.equal((await readProjects(query, [3])).length, 1);
  } finally {
    await db.close();
  }
});

test(
  "private six-project import is unpublished and preserves later edits on rerun",
  { skip: !fs.existsSync(".private-course/optional-projects.sql") },
  async () => {
    const db = new PGlite();
    try {
      await db.exec(fs.readFileSync("db/migrations/001_initial.sql", "utf8"));
      const sql = fs.readFileSync(
        ".private-course/optional-projects.sql",
        "utf8",
      );
      await db.exec(sql);
      assert.equal(
        (await db.query("SELECT * FROM optional_projects")).rows.length,
        6,
      );
      assert.equal(
        (await db.query("SELECT * FROM optional_projects WHERE published=true"))
          .rows.length,
        0,
      );
      await db.exec(
        "UPDATE optional_projects SET body='operator edit',published=true,revision=2 WHERE id='kernel-perceptron'",
      );
      await db.exec(sql);
      const [row] = (
        await db.query(
          "SELECT body,published,revision FROM optional_projects WHERE id='kernel-perceptron'",
        )
      ).rows;
      assert.deepEqual(row, {
        body: "operator edit",
        published: true,
        revision: 2,
      });
    } finally {
      await db.close();
    }
  },
);
