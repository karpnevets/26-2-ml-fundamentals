import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const base = "http://127.0.0.1:3000";
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of ["/login", "/privacy", "/admin"]) {
    assert.equal((await page.goto(base + path)).status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
  }
  assert.equal((await page.request.get(base + "/api/progress")).status(), 401);
  assert.equal(
    (await page.request.get(base + "/api/admin/export")).status(),
    401,
  );
  assert.equal(
    (
      await page.request.patch(base + "/api/progress", {
        headers: { Origin: base },
        data: { id: "w1:Model", completed: true },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await page.request.patch(base + "/api/progress", {
        headers: { Origin: "https://evil.example" },
        data: { id: "w1:Model", completed: true },
      })
    ).status(),
    403,
  );
  assert.equal(
    (
      await page.request.post(base + "/api/progress/import", {
        headers: { Origin: base },
        data: { ids: ["w1:Model"] },
      })
    ).status(),
    401,
  );
  await page.goto(base + "/login");
  await page.screenshot({ path: "qa/login-desktop.png", fullPage: true });
  const owner = "test-owner";
  let values = { "w1:Model": false };
  let fail = false;
  let mismatch = false;
  const writes = [];
  await page.route("**/api/me", (route) =>
    route.fulfill({
      json: {
        mode: "account",
        user: {
          id: owner,
          name: "테스트 학습자",
          email: "learner@snu.ac.kr",
          isAdmin: false,
        },
      },
    }),
  );
  await page.route("**/api/progress", async (route) => {
    const request = route.request();
    if (request.method() === "GET")
      return route.fulfill({ json: { ownerId: owner, values } });
    assert.equal(request.headers()["x-progress-owner"], owner);
    const body = request.postDataJSON();
    assert.deepEqual(Object.keys(body).sort(), ["completed", "id"]);
    if (mismatch)
      return route.fulfill({ status: 409, json: { error: "계정 변경" } });
    if (fail)
      return route.fulfill({ status: 503, json: { error: "DB unavailable" } });
    values = { ...values, [body.id]: body.completed };
    writes.push(body);
    return route.fulfill({ json: { ok: true } });
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "ml-sig-progress-v1",
      JSON.stringify({ "w1:Model": true, "w1:Parameter": true }),
    ),
  );
  await page.goto(base + "/week/1");
  const model = page.getByRole("checkbox", { name: "Model", exact: true });
  await expect(model).toBeEnabled();
  await expect(model).not.toBeChecked();
  assert.equal(writes.length, 0);
  await expect(
    page.getByRole("link", { name: "진행 현황", exact: true }),
  ).toHaveCount(0);
  await model.click();
  await expect(model).toBeChecked();
  assert.equal(values["w1:Model"], true);
  await page.reload();
  await expect(model).toBeChecked();
  fail = true;
  await model.click();
  await expect(
    page.getByText(
      "저장하지 못했습니다. 체크 상태는 바뀌지 않았습니다. 다시 눌러 주세요.",
    ),
  ).toBeVisible();
  await expect(model).toBeChecked();
  fail = false;
  let imports = 0;
  await page.route("**/api/progress/import", async (route) => {
    assert.equal(route.request().headers()["x-progress-owner"], owner);
    const { ids } = route.request().postDataJSON();
    for (const id of ids) {
      if (!(id in values)) {
        values[id] = true;
        imports++;
      }
    }
    return route.fulfill({ json: { values, imported: imports } });
  });
  await page.getByRole("button", { name: "기기 기록 가져오기" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Parameter", exact: true }),
  ).toBeChecked();
  assert.equal(imports, 1);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("ml-sig-progress-v1")),
    null,
  );
  mismatch = true;
  await model.click();
  await expect(model).toBeDisabled();
  await expect(
    page.getByText("로그인이 만료되었습니다. 다시 로그인해 주세요."),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/login");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: "qa/login-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: login/setup pages, real unauthenticated API rejection, cross-origin rejection, account-only UI, cloud save/reload/failure, explicit import, account-switch protection, mobile layout. Cloud responses were mocked only in the browser test.",
  );
} finally {
  await browser.close();
}
