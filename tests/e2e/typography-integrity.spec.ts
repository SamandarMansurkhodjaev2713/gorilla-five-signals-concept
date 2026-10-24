import { expect, test } from "@playwright/test";

import { waitForCompactFonts } from "./support/compact-fonts";
import { observeCompactRuntimeErrors } from "./support/compact-home";
import { expectSemanticPage, LOCALES } from "./support/site";
import {
  applyTypographyStress,
  verifyEntireLabelLine,
} from "./support/typography-integrity";
import {
  runTypographyJourney,
  verifyHeroTypography,
} from "./support/typography-journey";

const TYPOGRAPHY_VIEWPORT = { width: 320, height: 800 };
const TEXT_MODES = ["normal", "enlarged"] as const;
const CONTENT_MODES = ["reduced", "no-js"] as const;

for (const locale of LOCALES) {
  for (const textMode of TEXT_MODES) {
    for (const contentMode of CONTENT_MODES) {
      test(`GIVEN ${locale} ${textMode} ${contentMode} WHEN native typography flows THEN words and real journeys remain intact`, async ({
        browser,
        baseURL,
      }) => {
        if (baseURL === undefined)
          throw new Error("Typography contracts require baseURL.");
        const context = await browser.newContext({
          baseURL: new URL(baseURL).href,
          viewport: TYPOGRAPHY_VIEWPORT,
          javaScriptEnabled: contentMode !== "no-js",
          reducedMotion: "reduce",
        });
        try {
          const page = await context.newPage();
          const errors = observeCompactRuntimeErrors(page);
          await runTypographyJourney(page, {
            locale,
            enlarged: textMode === "enlarged",
            noJs: contentMode === "no-js",
          });
          expect(errors).toEqual([]);
        } finally {
          await context.close();
        }
      });
    }
  }
}

test("GIVEN the old narrow RU hero action WHEN enlarged words paint THEN word fracture is rejected", async ({
  page,
}) => {
  const errors = observeCompactRuntimeErrors(page);
  await page.setViewportSize(TYPOGRAPHY_VIEWPORT);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "ru", "?motion=static");
  await waitForCompactFonts(page);
  await applyTypographyStress(page);
  const scenario = { locale: "ru", enlarged: true, noJs: false } as const;
  await verifyHeroTypography(page, scenario);
  await page.addStyleTag({
    content:
      ".hero-copydeck { padding-inline: var(--space-3) !important; } .hero-actions > .hero-primary-action { inline-size: auto !important; padding-inline: var(--space-5) !important; overflow-wrap: anywhere !important; }",
  });
  await expect(verifyHeroTypography(page, scenario)).rejects.toThrow(
    "Whole-word fracture",
  );
  expect(errors).toEqual([]);
});

test("GIVEN the old Duel arrow column WHEN the normal Uzbek label paints THEN avoidable wrapping is rejected", async ({
  page,
}) => {
  const errors = observeCompactRuntimeErrors(page);
  await page.setViewportSize(TYPOGRAPHY_VIEWPORT);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "uz", "?motion=static");
  await waitForCompactFonts(page);
  const action = page.locator(".home-duel__action");
  const label = action.locator("b");
  await label.scrollIntoViewIfNeeded();
  await verifyEntireLabelLine(label, action);
  await page.addStyleTag({
    content:
      ".home-duel__action { padding-inline: var(--space-4) !important; grid-template-columns: minmax(0, 1fr) auto !important; } .home-duel__action b { grid-column: 1 !important; } .home-duel__action i { grid-column: 2 !important; grid-row: 2 !important; }",
  });
  await expect(verifyEntireLabelLine(label, action)).rejects.toThrow(
    "Whole-word fracture",
  );
  expect(errors).toEqual([]);
});
