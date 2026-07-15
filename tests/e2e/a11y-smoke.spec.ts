import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Smoke a11y sweep — runs axe-core against public routes.
 * Fails on any violation with impact 'critical' or 'serious'.
 * Add routes here as they become public / stable.
 */

const PUBLIC_ROUTES = ["/", "/login", "/auth", "/forgot-password"];

for (const route of PUBLIC_ROUTES) {
  test(`a11y: ${route} has no critical/serious violations`, async ({ page }) => {
    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    // Skip routes that don't exist in this build; smoke only.
    if (!resp || resp.status() >= 400) test.skip(true, `route ${route} not available`);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (blocking.length) {
      console.log(
        "A11y violations:",
        blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
      );
    }
    expect(blocking, `Blocking a11y issues on ${route}`).toEqual([]);
  });
}