import { test } from "@playwright/test";

import { localizedPath } from "./support/site";

const CHAPTERS = [
  "manifesto",
  "flavor-reactor",
  "home-truth-duel",
  "home-material-film",
  "tashkent-terminal",
  "home-service-dock",
] as const;
const FLAVORS = [
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
] as const;

for (const viewport of [
  { height: 900, name: "desktop", width: 1_440 },
  { height: 844, name: "mobile", width: 390 },
] as const) {
  test(`capture ${viewport.name}`, async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
    await page.setViewportSize(viewport);
    await page.goto(localizedPath("uz", "?motion=static"), {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate(() => document.fonts.ready);

    for (const chapter of CHAPTERS) {
      await page.locator(`.${chapter}`).screenshot({
        animations: "disabled",
        path: `.tmp/home-awards-v3/${viewport.name}-${chapter}.png`,
      });
    }
    for (const flavor of FLAVORS) {
      await page.locator(`[data-product-selector="${flavor}"]`).click();
      await page.locator(".flavor-reactor").screenshot({
        animations: "disabled",
        path: `.tmp/home-awards-v3/${viewport.name}-reactor-${flavor}.png`,
      });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: `.tmp/home-awards-v3/${viewport.name}-full.png`,
    });
  });
}
