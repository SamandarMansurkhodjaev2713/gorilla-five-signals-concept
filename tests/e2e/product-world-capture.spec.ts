import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { localizedPath, PRODUCT_SLUGS } from "./support/site";

const OUTPUT_DIRECTORY = path.resolve(".tmp/product-world-review");
const VIEWPORTS = [
  { height: 900, name: "desktop", width: 1440 },
  { height: 844, name: "mobile", width: 390 },
] as const;

test("capture product worlds for visual review", async ({ page }) => {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const slug of PRODUCT_SLUGS) {
      await page.goto(localizedPath("uz", `/products/${slug}`));
      const hero = page.locator(".product-hero");
      await expect(hero).toBeVisible();
      await hero.screenshot({
        animations: "disabled",
        path: path.join(OUTPUT_DIRECTORY, `${viewport.name}-${slug}.png`),
      });
    }
  }
});
