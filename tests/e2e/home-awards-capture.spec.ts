import { expect, type Locator, type Page, test } from "@playwright/test";

import { localizedPath } from "./support/site";

const CHAPTERS = [
  "hero",
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

const CAPTURE_ISOLATION_STYLE = `
  :is(.site-header, .skip-link) {
    position: absolute !important;
  }
`;

const captureSection = async (locator: Locator, page: Page, path: string) => {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await expect
    .poll(() =>
      page.evaluate(() => ({
        activeTag: document.activeElement?.tagName ?? null,
        skipFocusVisible:
          document.querySelector(".skip-link")?.matches(":focus-visible") ??
          false,
      })),
    )
    .toEqual({ activeTag: "BODY", skipFocusVisible: false });
  await locator.screenshot({
    animations: "disabled",
    path,
    // Chromium can composite fixed page chrome into locator screenshots at the
    // wrong document offset. Absolute positioning keeps a section capture
    // faithful after the unfocused-state assertion above.
    style: CAPTURE_ISOLATION_STYLE,
  });
};

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
      await captureSection(
        page.locator(`.${chapter}`),
        page,
        `.tmp/home-awards-v3/${viewport.name}-${chapter}.png`,
      );
    }
    for (const flavor of FLAVORS) {
      await page.locator(`[data-product-selector="${flavor}"]`).click();
      await captureSection(
        page.locator(".flavor-reactor"),
        page,
        `.tmp/home-awards-v3/${viewport.name}-reactor-${flavor}.png`,
      );
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: `.tmp/home-awards-v3/${viewport.name}-full.png`,
    });
  });
}
