import test from "node:test";
import assert from "node:assert/strict";
import { nextLearning } from "../lib/continue-learning";
test("resume incomplete week, respect locks, ignore optional work and finish course", () => {
  const weeks = Array.from({ length: 9 }, (_, week) => ({
    week,
    concepts: ["a", "b"],
  }));
  assert.deepEqual(nextLearning(weeks, {}), {
    href: "/week/1",
    label: "1주차 시작하기",
  });
  assert.equal(
    nextLearning(weeks, { "w1:a": true }).label,
    "1주차 이어서 학습",
  );
  const firstDone = { "w1:a": true, "w1:b": true };
  assert.equal(nextLearning(weeks, firstDone).href, "/week/2");
  assert.equal(nextLearning(weeks.slice(0, 2), firstDone).label, "2주차 열기");
  assert.equal(
    nextLearning(weeks, { "w2:a": true, "w2:b": true }).href,
    "/week/1",
  );
  const done = Object.fromEntries(
    weeks
      .slice(1)
      .flatMap((w) => w.concepts.map((c) => [`w${w.week}:${c}`, true])),
  );
  assert.equal(nextLearning(weeks, done).href, "/final-project");
});
