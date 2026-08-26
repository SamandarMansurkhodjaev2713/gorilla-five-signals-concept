import { expect, test } from "@playwright/test";

import {
  HOME_SCENE_IDS,
  ROUTE_SUFFIXES,
  expectNoHorizontalOverflow,
  expectSemanticPage,
  localizedPath,
} from "./support/site";

const ROUTE_MATRIX_TEST_TIMEOUT_MS = 120_000;

test.describe("semantic content contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN a visitor WHEN the homepage loads THEN every narrative scene and product route is exposed", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz");

    for (const sceneId of HOME_SCENE_IDS) {
      await expect(
        page.locator(`[data-motion-scene="${sceneId}"]`),
        `Missing scene ${sceneId}`,
      ).toHaveCount(1);
    }

    for (const suffix of ROUTE_SUFFIXES) {
      await expect(
        page.locator(`a[href="${localizedPath("uz", suffix)}"]`).first(),
        `No discoverable link to ${suffix || "home"}`,
      ).toBeAttached();
    }
  });

  test("GIVEN a rendered page WHEN semantics are inspected THEN it has no placeholder actions or broken image contracts", async ({
    page,
  }) => {
    test.setTimeout(ROUTE_MATRIX_TEST_TIMEOUT_MS);

    for (const suffix of ROUTE_SUFFIXES) {
      await expectSemanticPage(page, "uz", suffix);

      await expect(page.locator('a[href="#"], a[href=""]')).toHaveCount(0);
      await expect(page.locator("img:not([alt])")).toHaveCount(0);

      const idAudit = await page.locator("[id]").evaluateAll((elements) => {
        const ids = elements.map((element) => element.id);
        return {
          blankIds: ids.filter((id) => id.trim().length === 0),
          duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        };
      });
      expect(idAudit.blankIds).toEqual([]);
      expect(idAudit.duplicateIds).toEqual([]);
    }
  });

  test("GIVEN the compact viewport WHEN pages render THEN the document does not overflow horizontally", async ({
    page,
  }) => {
    test.setTimeout(ROUTE_MATRIX_TEST_TIMEOUT_MS);
    await page.setViewportSize({ width: 320, height: 800 });

    for (const suffix of ROUTE_SUFFIXES) {
      await expectSemanticPage(page, "uz", suffix);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("GIVEN a private preview WHEN metadata is inspected THEN indexing is blocked without losing SEO essentials", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz");

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S+/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(
      page.locator('meta[http-equiv="Content-Security-Policy"]'),
    ).toHaveAttribute("content", /default-src 'self'.*object-src 'none'/);
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
      "content",
      "strict-origin-when-cross-origin",
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /\S+/,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", /\S+/);
  });
});
