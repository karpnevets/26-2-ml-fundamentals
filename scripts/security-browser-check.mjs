import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const base = "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const violations = [];
  page.on("console", (m) => {
    if (m.type() === "error" && /Content Security Policy/.test(m.text()))
      violations.push(m.text());
  });
  const response = await page.goto(base);
  const headers = response.headers();
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert(headers["content-security-policy"].includes("script-src-attr 'none'"));
  const nonce = headers["content-security-policy"].match(/'nonce-([^']+)'/)[1];
  assert((await page.locator("script[nonce]").count()) > 0);
  assert.equal(
    await page
      .locator("script[nonce]")
      .first()
      .evaluate((s) => s.nonce),
    nonce,
  );
  const another = await page.request.get(base, {
    headers: {
      "x-nonce": "client-forged",
      "Content-Security-Policy": "script-src 'unsafe-inline'",
    },
  });
  assert.notEqual(
    another.headers()["content-security-policy"].match(/'nonce-([^']+)'/)[1],
    nonce,
  );
  assert(
    !another.headers()["content-security-policy"].includes("client-forged"),
  );
  await page
    .getByRole("button", { name: "2주차 잠금 해제", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel("암호", { exact: true })
    .fill("' OR 1=1 --");
  await page.getByRole("button", { name: "열기", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "로그인",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: /실험실/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Loss Playground", exact: true }),
  ).toBeVisible();
  const slider = page.locator("input[type=range]").first();
  await slider.fill("2");
  await expect(slider).toHaveValue("2");
  await page.goto(base + "/privacy");
  await expect(page.locator("main h1")).toBeVisible();
  assert.equal(
    violations.length,
    0,
    "normal pages must not produce CSP violations",
  );
  assert.equal(
    (
      await page.request.patch(base + "/api/progress", {
        headers: { Origin: "https://evil.test" },
        data: { id: "x", completed: true },
      })
    ).status(),
    403,
  );
  assert.equal(
    (
      await page.request.get(base + "/api/progress", {
        headers: { "sec-fetch-site": "cross-site" },
      })
    ).status(),
    403,
  );
  assert.equal(
    (
      await page.request.patch(base + "/api/progress", {
        headers: { Origin: base },
        data: { id: "x", completed: true },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await page.request.post(base + "/api/progress/import", {
        headers: { Origin: base },
        data: { ids: ["x".repeat(17000)] },
      })
    ).status(),
    413,
  );
  // A trusted test harness renders hostile Markdown through the real component.
  const payload =
    '<script>window.__mdAttack=true</script>\n\n<img src=x onerror="window.__mdAttack=true">\n\n[bad](javascript:alert(1))\n\n<details>\n<summary><img src=x onerror="window.__mdAttack=true"></summary>\ntext\n</details>';
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {LessonMarkdown} from './components/markdown';const root=document.createElement('div');root.id='md-probe';document.body.append(root);createRoot(root).render(<LessonMarkdown text={${JSON.stringify(payload)}}/>);`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  });
  await page.evaluate((code) => {
    const s = document.createElement("script");
    s.nonce = document.querySelector("script[nonce]").nonce;
    s.textContent = code;
    document.body.append(s);
  }, bundle.outputFiles[0].text);
  await expect(page.locator("#md-probe .prose")).not.toHaveCount(0);
  await expect(
    page.locator(
      '#md-probe script,#md-probe [onerror],#md-probe a[href^="javascript:"]',
    ),
  ).toHaveCount(0);
  assert.equal(await page.evaluate(() => window.__mdAttack), undefined);
  // Inject through an HTML response rather than privileged DevTools evaluation.
  const attackPage = await browser.newPage();
  await attackPage.route("**/privacy", async (route) => {
    const r = await route.fetch();
    const html = (await r.text()).replace(
      "</body>",
      '<script>window.__inlineAttack=true</script><button id="event-probe" onclick="window.__eventAttack=true">probe</button></body>',
    );
    await route.fulfill({ response: r, body: html });
  });
  await attackPage.goto(base + "/privacy");
  await attackPage.locator("#event-probe").click();
  assert.equal(
    await attackPage.evaluate(() => window.__inlineAttack),
    undefined,
  );
  assert.equal(
    await attackPage.evaluate(() => window.__eventAttack),
    undefined,
  );
  await attackPage.close();
  console.log(
    "PASS: production CSP/nonces, normal hydration/navigation/playground, hostile Markdown, inline/event-handler blocking, CSRF, anonymous auth and oversized payload rejection.",
  );
} finally {
  await browser.close();
}
