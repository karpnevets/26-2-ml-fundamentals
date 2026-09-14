import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { rejectRequest, contentSecurityPolicy } from "../lib/request-security";
import { consumeRequest, requestLimits } from "../lib/rate-limit-repository";
import { smallJson } from "../lib/http";
import type { Query } from "../lib/progress-repository";

const origin = "https://example.test";
test("public request gate rejects forged origins/oversized inputs but permits Google callback navigation", () => {
  const post = (headers: Record<string, string> = {}) =>
    new Request(origin + "/api/progress", { method: "PATCH", headers });
  assert.equal(rejectRequest(post(), origin)?.status, 403);
  assert.equal(
    rejectRequest(post({ origin: "https://evil.test" }), origin)?.status,
    403,
  );
  assert.equal(
    rejectRequest(post({ origin, host: "evil.test" }), origin),
    null,
  );
  assert.equal(rejectRequest(post({ origin }), undefined, true)?.status, 403);
  assert.equal(
    rejectRequest(post({ origin, "content-length": "999999" }), origin)?.status,
    413,
  );
  assert.equal(
    rejectRequest(post({ origin, "content-length": "-1" }), origin)?.status,
    413,
  );
  assert.equal(
    rejectRequest(
      new Request(origin + "/api/progress", {
        headers: { "sec-fetch-site": "cross-site" },
      }),
      origin,
    )?.status,
    403,
  );
  assert.equal(
    rejectRequest(
      new Request(origin + "/api/auth/callback/google?code=sample", {
        headers: { "sec-fetch-site": "cross-site" },
      }),
      origin,
    ),
    null,
  );
  assert.equal(
    rejectRequest(
      new Request(origin + "/login", {
        headers: { "sec-fetch-site": "cross-site" },
      }),
      origin,
    ),
    null,
  );
  assert.equal(
    rejectRequest(new Request(origin + "/?q=" + "x".repeat(8200)), origin)
      ?.status,
    414,
  );
  const csp = contentSecurityPolicy("server-random-nonce");
  assert(csp.includes("frame-ancestors 'none'"));
  assert(csp.includes("script-src-attr 'none'"));
  assert(
    !csp
      .split(";")
      .find((x) => x.trim().startsWith("script-src "))!
      .includes("unsafe-inline"),
  );
  assert(!csp.includes("unsafe-eval"));
});

test("chunked JSON cannot evade body limits and wrong content types are refused", async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("x".repeat(100)));
      controller.close();
    },
  });
  const request = new Request(origin, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: stream,
    duplex: "half",
  } as RequestInit);
  await assert.rejects(smallJson(request, 20));
  await assert.rejects(
    smallJson(
      new Request(origin, {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "{}",
      }),
    ),
  );
  assert.deepEqual(
    await smallJson(
      new Request(origin, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: '{"id":"example"}',
      }),
    ),
    { id: "example" },
  );
});

test("shared DB limits enforce concurrent requests, isolate accounts, expire and cap storage", async () => {
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync("db/setup.sql", "utf8"));
    const query: Query = async (sql, values = []) =>
      (await db.query<Record<string, unknown>>(sql, values)).rows;
    const [a] = await query(
      "INSERT INTO app_users(google_sub,email) VALUES('rl-a','rl-a@snu.ac.kr') RETURNING id",
    );
    const [b] = await query(
      "INSERT INTO app_users(google_sub,email) VALUES('rl-b','rl-b@snu.ac.kr') RETURNING id",
    );
    const outcomes = await Promise.all(
      Array.from({ length: requestLimits.write + 4 }, () =>
        consumeRequest(query, String(a.id), "write"),
      ),
    );
    assert.equal(outcomes.filter((r) => r.allowed).length, requestLimits.write);
    assert(outcomes.every((r) => r.retryAfter >= 1 && r.retryAfter <= 60));
    assert((await consumeRequest(query, String(b.id), "write")).allowed);
    assert((await consumeRequest(query, String(a.id), "read")).allowed);
    assert.equal(
      (
        await query(
          "SELECT attempts FROM api_rate_limits WHERE user_id=$1::uuid AND bucket='write'",
          [a.id],
        )
      )[0].attempts,
      61,
    );
    await query(
      "UPDATE api_rate_limits SET window_start=now()-interval '61 seconds' WHERE user_id=$1::uuid",
      [a.id],
    );
    assert((await consumeRequest(query, String(a.id), "write")).allowed);
    await query("DELETE FROM app_users WHERE id=$1::uuid", [a.id]);
    assert.equal(
      (
        await query("SELECT * FROM api_rate_limits WHERE user_id=$1::uuid", [
          a.id,
        ])
      ).length,
      0,
    );
    // User-controlled SQL-looking text remains a literal value.
    const payload = "'); DROP TABLE app_users; --";
    await query("INSERT INTO course_documents(name,body) VALUES($1,$2)", [
      payload,
      payload,
    ]);
    assert.equal(
      (
        await query("SELECT body FROM course_documents WHERE name=$1", [
          payload,
        ])
      )[0].body,
      payload,
    );
    assert.equal((await query("SELECT * FROM app_users")).length, 1);
  } finally {
    await db.close();
  }
});
