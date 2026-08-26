import { expect, test } from "@playwright/test";

import {
  ENGINE_SMOKE_SUFFIXES,
  HOME_SCENE_IDS,
  LOCALES,
  PRODUCT_SLUGS,
  ROUTE_SUFFIXES,
  expectSemanticPage,
} from "./support/site";

const ENGINE_PRODUCT_SLUGS = ["original", "lychee-pear"] as const;

test.use({ javaScriptEnabled: false });

test.describe("no-JavaScript baseline", () => {
  test("GIVEN JavaScript is unavailable WHEN the homepage loads THEN narrative content and navigation remain visible", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz");

    for (const sceneId of HOME_SCENE_IDS) {
      await expect(
        page.locator(`[data-motion-scene="${sceneId}"]`),
      ).toBeVisible();
    }

    await expect(page.locator("nav a").first()).toBeVisible();
    await expect(page.locator('a[href="/uz/find/"]').first()).toBeVisible();
  });

  test("GIVEN JavaScript is unavailable WHEN the required product matrix opens THEN product truth and a real next action remain visible", async ({
    browserName,
    page,
  }) => {
    const slugs =
      browserName === "chromium" ? PRODUCT_SLUGS : ENGINE_PRODUCT_SLUGS;
    for (const slug of slugs) {
      await expectSemanticPage(page, "uz", `/products/${slug}`);
      await expect(page.locator("main img").first()).toBeVisible();
      await expect(page.locator('a[href="/uz/find/"]').first()).toBeVisible();
    }
  });

  test("GIVEN JavaScript is unavailable WHEN the required localized matrix opens THEN semantic content, warning fallback, and navigation remain available", async ({
    browserName,
    page,
  }) => {
    test.setTimeout(120_000);
    const suffixes =
      browserName === "chromium" ? ROUTE_SUFFIXES : ENGINE_SMOKE_SUFFIXES;

    for (const locale of LOCALES) {
      for (const suffix of suffixes) {
        await expectSemanticPage(page, locale, suffix);
        await expect(page.locator("header.site-header")).toBeVisible();
        await expect(page.locator("footer.site-footer")).toBeVisible();
        if (suffix === "") {
          await expect(page.locator(".responsible-fallback")).toBeVisible();
        }
      }
    }
  });
});
