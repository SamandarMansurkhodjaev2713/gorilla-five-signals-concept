import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { getSiteCopy } from "../../src/features/site/copy";
import { waitForCompactFonts } from "./support/compact-fonts";
import { observeCompactRuntimeErrors } from "./support/compact-home";
import { expectSemanticPage, LOCALES } from "./support/site";
import {
  verifyTypographyStress,
  verifyWholeWords,
} from "./support/typography-integrity";

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
] as const;
const FILM_TEXT_STRESS = `
  html { font-size: 200% !important; }
  .home-material-film__copy :is(h2, p) {
    line-height: 1.5 !important;
    letter-spacing: .12em !important;
    word-spacing: .16em !important;
  }
  .home-material-film__copy p { margin-block-end: 2em !important; }
`;

test.use({ contextOptions: { reducedMotion: "reduce" } });

async function verifyFilmWords(page: Page): Promise<void> {
  const stage = page.locator(".home-material-film__stage");
  const copy = page.locator(".home-material-film__copy");
  await copy.scrollIntoViewIfNeeded();
  for (const subject of await copy.locator("h2, p").all()) {
    await verifyWholeWords(subject, stage);
  }
}

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    for (const enlarged of [false, true]) {
      test(`GIVEN ${locale} film ${viewport.width}px enlarged=${enlarged} WHEN localized text paints THEN whole words remain inside the actual clip`, async ({
        page,
      }) => {
        const errors = observeCompactRuntimeErrors(page);
        await page.setViewportSize(viewport);
        await page.addInitScript(() =>
          sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
        );
        await expectSemanticPage(page, locale, "/?motion=static");
        await waitForCompactFonts(page);
        const title = page.locator(".home-material-film__copy h2");
        await expect(title).toHaveText(getSiteCopy(locale).materialTitle);
        if (enlarged) {
          await page.addStyleTag({ content: FILM_TEXT_STRESS });
          await verifyTypographyStress(title);
        }
        await verifyFilmWords(page);
        expect(errors).toEqual([]);
      });
    }
  }
}

test("GIVEN the old intrinsic film grid WHEN enlarged Russian copy paints THEN clipped words are rejected", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "ru", "/?motion=static");
  await waitForCompactFonts(page);
  await page.locator(".home-material-film__copy h2").evaluate((title, text) => {
    title.textContent = text;
  }, getSiteCopy("ru").fiveStates);
  await page.addStyleTag({
    content: `${FILM_TEXT_STRESS}
      .home-material-film__copy-inner { grid-template-columns: none; min-inline-size: auto; }
      .home-material-film__copy h2 { min-inline-size: auto; font-size: 3.2rem; }`,
  });
  await expect(verifyFilmWords(page)).rejects.toThrow();
});
