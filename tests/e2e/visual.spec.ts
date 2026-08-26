import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  VISUAL_VIEWPORTS,
  acceptResponsibleEntry,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const PAGE_LEAD_VISUAL_CASES = [
  { height: 844, name: "mobile-390", width: 390 },
  { height: 900, name: "desktop-1440", width: 1_440 },
] as const;
const PAGE_LEAD_ROUTES = ["/compare", "/contact"] as const;
const CAPTURE_CONTENT_VISIBILITY_OVERRIDE = `
  [data-motion-scene] {
    content-visibility: visible !important;
    contain-intrinsic-block-size: none !important;
  }
`;

async function exposeDeferredScenesForCapture(page: Page): Promise<void> {
  await page.addStyleTag({ content: CAPTURE_CONTENT_VISIBILITY_OVERRIDE });
  await expect
    .poll(() =>
      page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>("[data-motion-scene]"),
        ].every(
          (scene) => getComputedStyle(scene).contentVisibility === "visible",
        ),
      ),
    )
    .toBe(true);
}

test.describe("responsive visual baseline", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const viewport of VISUAL_VIEWPORTS) {
    test(`GIVEN the ${viewport.name} viewport WHEN the Uzbek homepage renders THEN its approved composition is stable`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await expectSemanticPage(page, "uz", "?motion=static");
      await acceptResponsibleEntry(page);
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-static",
        "true",
      );
      await expectNoHorizontalOverflow(page);
      await page.evaluate(() => document.fonts.ready);
      await exposeDeferredScenesForCapture(page);
      await page.evaluate(async () => {
        const images = [...document.querySelectorAll("img")];
        for (const image of images) {
          image.loading = "eager";
        }
        await Promise.all(
          images.map(async (image) => {
            if (!image.complete) {
              await new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), {
                  once: true,
                });
              });
            }
          }),
        );
        await Promise.allSettled(images.map((image) => image.decode()));
      });
      await page.evaluate(() => window.scrollTo(0, 0));

      await expect(page).toHaveScreenshot(`home-uz-${viewport.name}.png`, {
        fullPage: true,
        timeout: 20_000,
      });
    });
  }

  for (const suffix of PAGE_LEAD_ROUTES) {
    for (const viewport of PAGE_LEAD_VISUAL_CASES) {
      const routeName = suffix.slice(1);
      test(`GIVEN ${routeName} at ${viewport.name} WHEN the Uzbek page lead renders THEN its type composition is stable`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await expectSemanticPage(page, "uz", `${suffix}?motion=static`);
        await acceptResponsibleEntry(page);
        await expectNoHorizontalOverflow(page);
        await page.evaluate(() => document.fonts.ready);

        await expect(page.locator("[data-page-lead]")).toHaveScreenshot(
          `${routeName}-uz-page-lead-${viewport.name}.png`,
          { timeout: 20_000 },
        );
      });
    }
  }
});
