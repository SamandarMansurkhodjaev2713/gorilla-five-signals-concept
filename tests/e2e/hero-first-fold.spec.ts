import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectSemanticPage,
  LOCALES,
} from "./support/site";

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;
const MINIMUM_ACTION_SIZE = 44;

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test(`GIVEN ${locale} at ${viewport.width}x${viewport.height} WHEN home opens THEN the primary action is immediately available within the first fold`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      await expectSemanticPage(page, locale);
      await page.evaluate(() => document.fonts.ready);
      const action = page.locator(".hero-primary-action");
      await expect(action).toHaveCount(1);
      await expect(action).toBeVisible();
      await expect(action).toHaveAttribute("href", `/${locale}/products/`);
      expect(
        await action.evaluate((element) =>
          element.closest("[data-motion-hero-support]"),
        ),
      ).toBeNull();
      await expect
        .poll(async () => {
          const bounds = await action.boundingBox();
          if (bounds === null) return false;
          return (
            bounds.width >= MINIMUM_ACTION_SIZE &&
            bounds.height >= MINIMUM_ACTION_SIZE &&
            bounds.y >= 0 &&
            bounds.y + bounds.height <= viewport.height
          );
        })
        .toBe(true);
      await expectNoHorizontalOverflow(page);
    });
  }
}
