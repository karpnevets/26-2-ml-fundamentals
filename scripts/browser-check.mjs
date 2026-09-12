import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = "http://127.0.0.1:3000";
  fs.mkdirSync("qa", { recursive: true });
  const routes = [
    "/",
    ...Array.from({ length: 9 }, (_, i) => `/week/${i}`),
    "/assignments",
    "/glossary",
    "/playground",
    "/final-project",
  ];
  for (const route of routes) {
    const r = await page.goto(base + route);
    assert.equal(r.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator(".katex-error").count(), 0, route);
    if (route.startsWith("/week/")) {
      const week = Number(route.split("/").at(-1));
      const file = fs
        .readdirSync("content")
        .find((f) => f.startsWith(`week-${week}-`));
      const source = fs
        .readFileSync(`content/${file}`, "utf8")
        .replace(/```[\s\S]*?```/g, "");
      const count = [...source.matchAll(/\\\[([\s\S]*?)\\\]|\\\((.*?)\\\)/g)]
        .length;
      assert.equal(
        await page.locator(".katex").count(),
        count,
        `${route}: every equation renders`,
      );
    }
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route + " desktop overflow",
    );
  }
  await page.goto(base + "/");
  await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });
  await page.goto(base + "/week/1");
  await page.getByRole("checkbox", { name: "Model", exact: true }).check();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("ml-sig-progress-v1") || "{}")[
            "w1:Model"
          ],
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Model", exact: true }),
  ).toBeChecked();
  await page.locator(".assignment").first().getByRole("checkbox").check();
  await page.goto(base + "/assignments");
  await page
    .locator(".assignment-week")
    .nth(1)
    .locator("summary")
    .first()
    .click();
  assert(
    await page
      .locator(".assignment-week")
      .nth(1)
      .getByRole("checkbox")
      .first()
      .isChecked(),
  );
  await page.goto(base + "/week/1");
  console.log("math toggle count", await page.locator(".math-details").count());
  await page.locator(".math-details summary").first().click();
  await expect(
    page.locator(".math-details .katex-display").first(),
  ).toBeVisible();
  await page
    .locator(".math-details")
    .first()
    .screenshot({ path: "qa/math.png" });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "복사", exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "복사됨", exact: true }),
  ).toBeVisible();
  assert(
    (await page.evaluate(() => navigator.clipboard.readText())).length > 0,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "qa/lesson-desktop.png", fullPage: false });
  await page.goto(base + "/playground");
  const before = await page.locator(".stats").innerText();
  await page.getByRole("slider", { name: "Parameter w" }).press("ArrowRight");
  assert.notEqual(await page.locator(".stats").innerText(), before);
  for (let i = 0; i < 7; i++) {
    await page.locator(".lab-tabs button").nth(i).click();
    assert(await page.locator(".lab h2").innerText());
  }
  await page.goto(base + "/glossary");
  await page.getByRole("textbox").fill("Gradient");
  await expect(page.locator(".glossary-grid article")).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(base + route);
    await page
      .locator(".math-details")
      .evaluateAll((els) => els.forEach((el) => (el.open = true)));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route + " mobile overflow",
    );
  }
  await page.goto(base + "/");
  await page.screenshot({ path: "qa/home-mobile.png", fullPage: true });
  await page.goto(base + "/week/3");
  await page.screenshot({ path: "qa/lesson-mobile.png", fullPage: false });
  await page.goto(base + "/playground");
  for (let i = 0; i < 7; i++) {
    await page.locator(".lab-tabs button").nth(i).click();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `mobile lab ${i}`,
    );
  }
  await page.goto(base + "/week/8");
  await page.locator(".recap-flow button").last().press("Enter");
  await expect(page.locator(".recap-detail h3")).toHaveText(
    "Backpropagation ←",
  );
  assert.equal((await page.goto(base + "/week/9")).status(), 404);
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("disabled");
      },
    });
  });
  const p = await blocked.newPage();
  await p.goto(base + "/week/1");
  await p.getByRole("checkbox", { name: "Model", exact: true }).check();
  assert(
    await p.getByRole("checkbox", { name: "Model", exact: true }).isChecked(),
  );
  assert(await p.locator(".storage-note").isVisible());
  assert.deepEqual(errors, []);
  console.log(
    "PASS: all routes, equations, desktop/mobile widths, local progress, assignment sync, all labs, glossary and blocked storage.",
  );
} finally {
  await browser.close();
}
