import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { getSiteCopy } from "../../src/features/site/copy";
import { waitForCompactFonts } from "./support/compact-fonts";
import { observeCompactRuntimeErrors } from "./support/compact-home";
import {
  expectNoHorizontalOverflow,
  expectSemanticPage,
  LOCALES,
} from "./support/site";
import {
  verifyNativeTarget,
  verifyWholeWords,
} from "./support/typography-integrity";

const FAQ_VIEWPORTS = [
  { name: "compact", width: 320, height: 800 },
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
] as const;
const EXPECTED_GROUPS = {
  en: ["Product", "Availability", "Partnership", "Contact"],
  ru: ["Продукт", "Наличие", "Партнёрство", "Контакты"],
  uz: ["Mahsulot", "Mavjudlik", "Hamkorlik", "Bog‘lanish"],
} as const;

test.use({ contextOptions: { reducedMotion: "reduce" } });

async function verifyFaqWordLayout(page: Page): Promise<void> {
  const headers = page.locator(".group-header");
  await expect(headers).toHaveCount(4);
  for (const header of await headers.all()) {
    await header.scrollIntoViewIfNeeded();
    await verifyWholeWords(header.locator("h2"), header);
  }
  const contact = page.locator(".manual-contact");
  await contact.scrollIntoViewIfNeeded();
  await verifyWholeWords(contact.locator("strong"), contact);
  await verifyNativeTarget(contact);
}

for (const locale of LOCALES) {
  for (const viewport of FAQ_VIEWPORTS) {
    test(`GIVEN ${locale} FAQ at ${viewport.name} WHEN headings and contact action paint THEN whole words and native controls remain intact`, async ({
      page,
    }) => {
      const errors = observeCompactRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      await expectSemanticPage(page, locale, "/faq?motion=static");
      await waitForCompactFonts(page);
      await expect(page.locator(".group-header h2")).toHaveText(
        EXPECTED_GROUPS[locale],
      );
      await expect(page.locator(".manual-contact strong")).toHaveText(
        getSiteCopy(locale).contactIntro,
      );
      await verifyFaqWordLayout(page);
      await expectNoHorizontalOverflow(page);
      const firstAnswer = page.locator(".group-questions details").first();
      const summary = firstAnswer.locator("summary");
      await expect(firstAnswer).toHaveAttribute("open", "");
      await verifyNativeTarget(summary);
      await summary.focus();
      await expect(summary).toBeFocused();
      await summary.press("Enter");
      await expect(firstAnswer).not.toHaveAttribute("open", "");
      await summary.press("Enter");
      await expect(firstAnswer).toHaveAttribute("open", "");
      await expect(firstAnswer.locator(".manual-answer")).toBeVisible();
      const contact = page.locator(".manual-contact");
      await contact.focus();
      await expect(contact).toBeFocused();
      await contact.press("Enter");
      await expect(page).toHaveURL((url) =>
        url.pathname.endsWith(`/${locale}/contact/`),
      );
      await expect(page.locator("[data-contact-official]")).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}

test("GIVEN the old FAQ label and count columns WHEN normal English 320px words paint THEN the final-letter fracture is rejected", async ({
  page,
}) => {
  const errors = observeCompactRuntimeErrors(page);
  await page.setViewportSize(FAQ_VIEWPORTS[0]);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "en", "/faq?motion=static");
  await waitForCompactFonts(page);
  await verifyFaqWordLayout(page);
  await page.addStyleTag({
    content:
      ".group-header h2 { grid-column: auto !important; grid-row: auto !important; overflow-wrap: break-word !important; } .group-header .type-label { grid-column: 1 / -1 !important; grid-row: auto !important; } .group-header .type-data { grid-column: auto !important; grid-row: auto !important; }",
  });
  await expect(verifyFaqWordLayout(page)).rejects.toThrow(
    "Whole-word fracture",
  );
  expect(errors).toEqual([]);
});
