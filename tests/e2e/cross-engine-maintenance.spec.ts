import { expect, test } from "@playwright/test";

import {
  verifyNativeModalFocusBoundary,
  verifyNonmodalFocusCounterControl,
} from "./support/native-modal";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";
const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
const REDUCED_CASES = [
  { mode: "system", preference: "system", media: "reduce" },
  { mode: "user", preference: "reduced", media: "no-preference" },
] as const;

for (const scenario of REDUCED_CASES) {
  test(`GIVEN ${scenario.mode} Reduced motion WHEN a product action navigates THEN semantic content and the reduced preference survive`, async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.emulateMedia({ reducedMotion: scenario.media });
    await page.addInitScript(
      ({ confirmationKey, preferenceKey, preference }) => {
        sessionStorage.setItem(confirmationKey, "true");
        localStorage.setItem(preferenceKey, preference);
      },
      {
        confirmationKey: CONFIRMATION_KEY,
        preferenceKey: MOTION_PREFERENCE_KEY,
        preference: scenario.preference,
      },
    );
    await expectSemanticPage(page, "uz", "/products/original");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(page.locator("[data-product-world]")).toHaveAttribute(
      "data-world-entrance-ready",
      "static",
    );
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("aria-pressed");
    await page.locator("[data-world-copy] a[href*='/find/']").click();
    await expect(page).toHaveURL(/\/uz\/find\/\?product=original$/);
    await expect(page.locator("h1")).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    expect(errors).toEqual([]);
  });
}

test("GIVEN a new product visit WHEN the checkpoint opens and confirms THEN focus and modal ownership are deterministic", async ({
  page,
}) => {
  const errors = await collectRuntimeErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectSemanticPage(page, "uz", "/products/original");
  const dialog = page.locator("[data-responsible-entry]");
  const continueButton = dialog.locator("[data-responsible-continue]");
  const backgroundBrand = page.locator(".site-header > a.brand");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(continueButton).toBeFocused();
  await verifyNativeModalFocusBoundary(dialog, backgroundBrand);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(dialog.locator("[data-responsible-leave]")).toBeFocused();
  await continueButton.click();
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator("h1")).toBeVisible();
  await verifyNonmodalFocusCounterControl(dialog, backgroundBrand);
  expect(errors).toEqual([]);
});

test("GIVEN a confirmed compact visit WHEN the menu opens and Escape closes it THEN modal semantics and focus restore without overflow", async ({
  page,
}) => {
  const errors = await collectRuntimeErrors(page);
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    (confirmationKey) => sessionStorage.setItem(confirmationKey, "true"),
    CONFIRMATION_KEY,
  );
  await expectSemanticPage(page, "uz");
  const menu = page.locator("[data-motion-menu]");
  const trigger = menu.locator("summary");
  await trigger.click();
  const panel = menu.locator("[data-motion-menu-panel]");
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await expect(menu.locator("[data-motion-menu-close]")).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  expect(errors).toEqual([]);
});
