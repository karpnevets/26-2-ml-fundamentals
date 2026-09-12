import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedGoogleProfile,
  schoolEmail,
  adminEmail,
  sameOrigin,
} from "../lib/auth/policy";
import {
  validProgressChange,
  validImport,
  localProgress,
} from "../lib/progress-policy";
const valid = {
  email: "student@snu.ac.kr",
  email_verified: true,
  hd: "snu.ac.kr",
  sub: "google-stable-id",
};
test("only a verified managed SNU Google identity can register", () => {
  assert.equal(allowedGoogleProfile("google", valid), true);
  for (const patch of [
    { email: "student@gmail.com" },
    { email: "s@snu.ac.kr.evil.com" },
    { email: "s@department.snu.ac.kr" },
    { email: "s@@snu.ac.kr" },
    { email: "s@snu.ac.kr " },
    { hd: undefined },
    { hd: "evil.com" },
    { email_verified: false },
    { email_verified: "true" },
    { sub: "" },
  ])
    assert.equal(
      allowedGoogleProfile("google", { ...valid, ...patch }),
      false,
      JSON.stringify(patch),
    );
  assert.equal(allowedGoogleProfile("credentials", valid), false);
  assert.equal(allowedGoogleProfile("google", null), false);
});
test("admin is exact allowlist and school domain only", () => {
  assert.equal(
    adminEmail("owner@snu.ac.kr", " owner@snu.ac.kr, second@snu.ac.kr "),
    true,
  );
  assert.equal(adminEmail("other@snu.ac.kr", "owner@snu.ac.kr"), false);
  assert.equal(adminEmail("owner@gmail.com", "owner@gmail.com"), false);
  assert.equal(adminEmail("owner@snu.ac.kr", undefined), false);
  assert.equal(schoolEmail("owner@snu.ac.kr.evil.com"), false);
});
test("mutations need matching Origin, including port and scheme", () => {
  const req = (origin?: string) =>
    new Request("https://course.example/api/progress", {
      headers: origin ? { origin } : {},
    });
  assert.equal(sameOrigin(req("https://course.example")), true);
  for (const origin of [
    undefined,
    "null",
    "https://evil.example",
    "http://course.example",
    "https://course.example:444",
  ])
    assert.equal(sameOrigin(req(origin)), false);
});
test("only catalog item boolean updates, no client-selected owner", () => {
  const allowed = new Set(["w1:Model", "w2:Gradient"]);
  assert.deepEqual(
    validProgressChange({ id: "w1:Model", completed: false }, allowed),
    { id: "w1:Model", completed: false },
  );
  for (const body of [
    { id: "w9:x", completed: true },
    { id: "w1:Model", completed: "true" },
    { id: "w1:Model", completed: true, userId: "someone-else" },
    null,
    [],
  ])
    assert.equal(validProgressChange(body, allowed), null);
  assert.deepEqual(validImport({ ids: ["w1:Model", "w1:Model"] }, allowed), [
    "w1:Model",
  ]);
  assert.equal(validImport({ ids: ["w9:unknown"] }, allowed), null);
  assert.deepEqual(
    localProgress({ bad: true, "w1:Model": true, "w2:Gradient": "yes" }),
    { "w1:Model": true },
  );
});

test("canonical public origin overrides internal server URL or forwarded host", () => {
  const req = new Request("http://localhost:3000/api/progress", {
    headers: { origin: "https://course.vercel.app", host: "internal.example" },
  });
  assert.equal(sameOrigin(req, "https://course.vercel.app"), true);
  assert.equal(sameOrigin(req, "https://other.vercel.app"), false);
  const local = new Request("http://localhost:3000/api/progress", {
    headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" },
  });
  assert.equal(sameOrigin(local), true);
});
