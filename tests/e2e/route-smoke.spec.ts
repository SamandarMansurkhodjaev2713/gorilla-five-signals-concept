import { expect, test } from "@playwright/test";

import {
  ENGINE_SMOKE_SUFFIXES,
  LOCALES,
  ROUTE_SUFFIXES,
  expectSemanticPage,
} from "./support/site";

test.describe("localized route inventory", () => {
  test("GIVEN the production build WHEN every required route is requested THEN semantic HTML is returned", async ({
    browserName,
    page,
  }) => {
    test.setTimeout(browserName === "chromium" ? 120_000 : 60_000);
    const suffixes =
      browserName === "chromium" ? ROUTE_SUFFIXES : ENGINE_SMOKE_SUFFIXES;

    for (const locale of LOCALES) {
      for (const suffix of suffixes) {
        await expectSemanticPage(page, locale, suffix);
      }
    }
  });

  test("GIVEN an unknown route WHEN requested THEN the custom 404 remains useful", async ({
    page,
  }) => {
    const response = await page.goto("/route-that-does-not-exist/", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(404);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('main a[href="/uz/"]').first()).toBeVisible();
  });
});
