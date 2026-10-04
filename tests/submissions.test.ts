import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { validNotebook, MAX_NOTEBOOK_BYTES } from "../lib/submission-policy";
import { smallText } from "../lib/http";
import { rejectRequest } from "../lib/request-security";
import {
  canSubmitProject,
  readNotebook,
  readOwnSubmissions,
  readReviewQueue,
  requestFeedback,
  saveFeedback,
  submissionStorageReady,
  uploadSubmission,
} from "../lib/submission-repository";
import type { Query } from "../lib/progress-repository";
const notebook = JSON.stringify({
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {},
  cells: [
    {
      cell_type: "code",
      metadata: {},
      source: ["print(1)"],
      execution_count: 1,
      outputs: [{ output_type: "stream", name: "stdout", text: ["1\n"] }],
    },
  ],
});
test("notebook validation and request limits reject invalid, disguised and oversized files", async () => {
  assert(validNotebook("실습.ipynb", notebook));
  for (const name of ["x.html", "../x.ipynb", "x\r\n.ipynb", "x\\y.ipynb"])
    assert(!validNotebook(name, notebook));
  for (const body of [
    "<html>not a notebook</html>",
    "{}",
    '{"nbformat":4,"nbformat_minor":0,"metadata":{},"cells":[null]}',
    notebook.replace('"nbformat":4', '"nbformat":3'),
    notebook.replace('"print(1)"', "123"),
  ])
    assert(!validNotebook("x.ipynb", body));
  assert(!validNotebook("x.ipynb", notebook + " ".repeat(MAX_NOTEBOOK_BYTES)));
  const origin = "https://example.test";
  const req = (length: number, path = "/api/assignments/demo/submission") =>
    new Request(origin + path, {
      method: "PUT",
      headers: { origin, "content-length": String(length) },
    });
  assert.equal(rejectRequest(req(MAX_NOTEBOOK_BYTES), origin), null);
  assert.equal(rejectRequest(req(MAX_NOTEBOOK_BYTES + 1), origin)?.status, 413);
  assert.equal(
    rejectRequest(req(MAX_NOTEBOOK_BYTES, "/api/progress"), origin)?.status,
    413,
  );
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new Uint8Array(11));
      c.close();
    },
  });
  await assert.rejects(
    smallText(
      new Request(origin, {
        method: "PUT",
        body: stream,
        duplex: "half",
      } as RequestInit),
      10,
    ),
  );
  await assert.rejects(
    smallText(
      new Request(origin, { method: "PUT", body: new Uint8Array([255]) }),
      10,
    ),
  );
});
test("submission ownership, eligibility, request/review lifecycle, stale writes and migration reruns", async () => {
  const db = new PGlite();
  const query: Query = async (sql, args = []) =>
    (await db.query<Record<string, unknown>>(sql, args)).rows;
  try {
    assert.equal(await submissionStorageReady(query), false);
    await db.exec(fs.readFileSync("db/migrations/001_initial.sql", "utf8"));
    await db.exec(
      fs.readFileSync("db/migrations/007_optional_projects.sql", "utf8"),
    );
    const migration = fs.readFileSync(
      "db/migrations/008_project_submissions.sql",
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration);
    assert.equal(await submissionStorageReady(query), true);
    const users = await query(
      "INSERT INTO app_users(google_sub,email) VALUES ('a','a@snu.ac.kr'),('b','b@snu.ac.kr'),('admin','admin@snu.ac.kr') RETURNING id",
    );
    const [a, b, admin] = users.map((r) => String(r.id));
    await query(
      "INSERT INTO optional_projects(id,week,title,published) VALUES ('demo',3,'Demo',true),('private',3,'Private',false)",
    );
    assert.equal(await canSubmitProject(query, "demo", []), false);
    assert.equal(await canSubmitProject(query, "private", [3]), false);
    assert.equal(await canSubmitProject(query, "demo", [3]), true);
    const first = await uploadSubmission(
      query,
      "demo",
      a,
      "실습.ipynb",
      notebook,
      0,
    );
    assert.equal(first?.status, "draft");
    assert.equal(first?.revision, 1);
    assert.deepEqual(await readOwnSubmissions(query, b), []);
    assert.equal((await readOwnSubmissions(query, a)).length, 1);
    assert(
      !JSON.stringify(await readOwnSubmissions(query, a)).includes("print(1)"),
    );
    assert.deepEqual(await readReviewQueue(query), []);
    assert.equal(
      await readNotebook(query, "demo", a, { id: b, isAdmin: false }, 1),
      null,
    );
    assert.equal(
      await readNotebook(query, "demo", a, { id: admin, isAdmin: true }, 1),
      null,
    );
    assert.equal(
      (await readNotebook(query, "demo", a, { id: a, isAdmin: false }, 1))
        ?.text,
      notebook,
    );
    assert.equal(
      await uploadSubmission(query, "demo", a, "old.ipynb", notebook, 0),
      null,
    );
    assert.equal(await requestFeedback(query, "demo", b, 1), null);
    assert.equal(
      await saveFeedback(query, "demo", a, admin, 1, "not requested"),
      null,
    );
    const requested = await requestFeedback(query, "demo", a, 1);
    assert.equal(requested?.status, "requested");
    assert.equal(requested?.revision, 2);
    assert.equal(await requestFeedback(query, "demo", a, 1), null);
    const queue = await readReviewQueue(query);
    assert.equal(queue.length, 1);
    assert.equal(queue[0].email, "a@snu.ac.kr");
    assert(!JSON.stringify(queue).includes("print(1)"));
    assert.equal(
      (await readNotebook(query, "demo", a, { id: admin, isAdmin: true }, 2))
        ?.text,
      notebook,
    );
    assert.equal(
      await readNotebook(query, "demo", a, { id: b, isAdmin: false }, 2),
      null,
    );
    const reviewed = await saveFeedback(
      query,
      "demo",
      a,
      admin,
      2,
      "gradient를 다시 확인하세요.",
    );
    assert.equal(reviewed?.status, "reviewed");
    assert.equal(reviewed?.revision, 3);
    assert.equal(
      (await readOwnSubmissions(query, a))[0].feedback,
      "gradient를 다시 확인하세요.",
    );
    assert.equal(await saveFeedback(query, "demo", a, admin, 2, "stale"), null);
    const replacement = await uploadSubmission(
      query,
      "demo",
      a,
      "새 실습.ipynb",
      notebook,
      3,
    );
    assert.equal(replacement?.status, "draft");
    assert.equal(replacement?.feedback, "");
    assert.equal(replacement?.requestedAt, null);
    assert.equal(
      await saveFeedback(query, "demo", a, admin, 3, "old file"),
      null,
    );
    assert.equal(
      await readNotebook(query, "demo", a, { id: admin, isAdmin: true }, 3),
      null,
    );
    assert.deepEqual(await readReviewQueue(query), []);
    await db.exec(migration);
    assert.equal(
      (await readOwnSubmissions(query, a))[0].filename,
      "새 실습.ipynb",
    );
    await query("DELETE FROM app_users WHERE id=$1::uuid", [a]);
    assert.deepEqual(await readOwnSubmissions(query, a), []);
  } finally {
    await db.close();
  }
});
