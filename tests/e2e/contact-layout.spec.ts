import { expect, test } from "@playwright/test";

import { waitForCompactFonts } from "./support/compact-fonts";
import { observeCompactRuntimeErrors } from "./support/compact-home";
import { verifyContactLayout } from "./support/contact-layout";
import {
  expectNoHorizontalOverflow,
  expectSemanticPage,
  LOCALES,
} from "./support/site";

const CONTACT_VIEWPORTS = [
  { name: "compact", width: 320, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "landscape-boundary", width: 1024, height: 768 },
  { name: "wide-tablet-boundary", width: 1280, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.use({ contextOptions: { reducedMotion: "reduce" } });

for (const locale of LOCALES) {
  for (const viewport of CONTACT_VIEWPORTS) {
    test(`GIVEN ${locale} contact at ${viewport.name} WHEN routing columns paint THEN copy and official action remain inside their real clipping owner`, async ({
      page,
    }) => {
      const errors = observeCompactRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      await expectSemanticPage(page, locale, "/contact?motion=static");
      await waitForCompactFonts(page);
      await verifyContactLayout(page);
      await expectNoHorizontalOverflow(page);
      expect(errors).toEqual([]);
    });
  }
}

test("GIVEN the old minimum-width Contact grid WHEN the 1024px layout is measured THEN clipped columns cannot pass through zero document overflow", async ({
  page,
}) => {
  const errors = observeCompactRuntimeErrors(page);
  await page.setViewportSize(CONTACT_VIEWPORTS[2]);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "uz", "/contact?motion=static");
  await waitForCompactFonts(page);
  await verifyContactLayout(page);
  await page.addStyleTag({
    content:
      ".routing-board { grid-template-columns: minmax(18rem, 4fr) minmax(30rem, 5fr) minmax(18rem, 3fr) !important; } .routing-copy { grid-column: auto !important; }",
  });
  await expectNoHorizontalOverflow(page);
  await expect(verifyContactLayout(page)).rejects.toThrow(
    "Contact column escapes board",
  );
  expect(errors).toEqual([]);
});
