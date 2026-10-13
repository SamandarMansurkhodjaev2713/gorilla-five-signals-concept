import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { expectCaptureContent, prepareSectionCapture } from "./support/capture";
import { localizedPath, PRODUCT_SLUGS } from "./support/site";

const OUTPUT_DIRECTORY = path.resolve(".tmp/product-world-review");
const VIEWPORTS = [
  { height: 900, name: "desktop", width: 1440 },
  { height: 844, name: "mobile", width: 390 },
] as const;

for (const viewport of VIEWPORTS) {
  for (const slug of PRODUCT_SLUGS) {
    test(`capture ${slug} world on ${viewport.name}`, async ({
      page,
      browserName,
    }) => {
      await mkdir(OUTPUT_DIRECTORY, { recursive: true });
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      await page.goto(localizedPath("uz", `/products/${slug}`));
      const hero = page.locator(".product-hero");
      await expect(hero).toBeVisible();
      await prepareSectionCapture(hero);
      const capture = await hero.screenshot({
        animations: "disabled",
        path: path.join(
          OUTPUT_DIRECTORY,
          `${browserName}-${viewport.name}-${slug}.png`,
        ),
      });
      await expectCaptureContent(capture);
    });
  }
}
