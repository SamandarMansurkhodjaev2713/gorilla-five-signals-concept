import { expect, test } from "@playwright/test";

import { waitForCompactFonts } from "./support/compact-fonts";

import {
  verifyCompactHeadingClearance,
  verifyCompactMenu,
} from "./support/compact-header";

import {
  applyCompactTextStress,
  observeCompactRuntimeErrors,
  verifyCompactHomeParity,
  verifyNoJsScrollFallback,
} from "./support/compact-home";
import {
  expectNoHorizontalOverflow,
  expectSemanticPage,
  LOCALES,
} from "./support/site";

const COMPACT_CONTEXTS = [
  { name: "portrait", width: 320, height: 800 },
  { name: "short-landscape", width: 320, height: 240 },
] as const;
const CONTENT_MODES = ["reduced", "no-js"] as const;
const PACKSHOT_COMPRESSION_RATIO = 0.5;

for (const locale of LOCALES) {
  for (const viewport of COMPACT_CONTEXTS) {
    for (const mode of CONTENT_MODES) {
      test(`GIVEN ${locale} ${viewport.name} ${mode} WHEN 200% text spacing grows THEN description, art and real actions remain complete`, async ({
        browser,
        baseURL,
      }) => {
        if (baseURL === undefined)
          throw new Error("Compact contracts require an isolated baseURL.");
        const applicationURL = new URL(baseURL);
        const context = await browser.newContext({
          baseURL: applicationURL.href,
          viewport,
          javaScriptEnabled: mode !== "no-js",
          reducedMotion: "reduce",
        });
        try {
          const page = await context.newPage();
          const errors = observeCompactRuntimeErrors(page);
          await page.addInitScript(() =>
            sessionStorage.setItem(
              "gorilla-responsible-entry-confirmed",
              "true",
            ),
          );
          await expectSemanticPage(page, locale, "?motion=static");
          await waitForCompactFonts(page);
          if (mode === "no-js") {
            await verifyNoJsScrollFallback(page);
          }
          await applyCompactTextStress(page);
          await verifyCompactHomeParity(page);
          await expectNoHorizontalOverflow(page);
          if (mode === "reduced") {
            await verifyCompactMenu(page);
            await verifyCompactHeadingClearance(page);
          }
          const action = page.locator(".hero-primary-action");
          await action.focus();
          await expect(action).toBeFocused();
          await action.press("Enter");
          await expect(page).toHaveURL(
            new RegExp(`/${locale}/products/$`, "u"),
          );
          expect(errors).toEqual([]);
        } finally {
          await context.close();
        }
      });
    }
  }
}

test("GIVEN the old hidden-description mutation WHEN parity is measured THEN the contract rejects it", async ({
  page,
}) => {
  await page.setViewportSize(COMPACT_CONTEXTS[0]);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "uz", "?motion=static");
  await waitForCompactFonts(page);
  await verifyCompactHomeParity(page);
  await page.addStyleTag({
    content: ".hero-copydeck > p { display: none !important; }",
  });
  await expect(verifyCompactHomeParity(page)).rejects.toThrow();
});

test("GIVEN compressed packshot width WHEN parity is measured THEN native aspect rejects it", async ({
  page,
}) => {
  await page.setViewportSize(COMPACT_CONTEXTS[0]);
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, "uz", "?motion=static");
  await waitForCompactFonts(page);
  await verifyCompactHomeParity(page);
  const imageWidth = await page
    .locator(".hero-primary-can img")
    .evaluate((image) => Number.parseFloat(getComputedStyle(image).width));
  await page.addStyleTag({
    content: `.hero-primary-can { inline-size: ${String(imageWidth * PACKSHOT_COMPRESSION_RATIO)}px !important; }`,
  });
  await expect(verifyCompactHomeParity(page)).rejects.toThrow(
    "Native packshot aspect",
  );
});
