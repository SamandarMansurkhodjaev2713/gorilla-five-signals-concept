import { expect, test } from "@playwright/test";

import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";

const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const PREFERENCE_KEY = "gorilla:motion-preference:v1";

for (const input of ["mouse", "touch"] as const) {
  test.describe(`menu activation with ${input}`, () => {
    test.use({ hasTouch: true, viewport: { width: 1440, height: 900 } });

    test(`GIVEN an opening Full-motion menu WHEN ${input} activates pause THEN the actual button receives one click and spatial motion stops`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ confirmationKey, preferenceKey }) => {
          sessionStorage.setItem(confirmationKey, "true");
          localStorage.setItem(preferenceKey, "full");
        },
        { confirmationKey: CONFIRMATION_KEY, preferenceKey: PREFERENCE_KEY },
      );
      await page.goto("/uz/");
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-runtime-state",
        "ready",
      );
      const toggle = await openConsumerMotionControls(page);
      await toggle.evaluate((element) => {
        element.setAttribute("data-test-click-count", "0");
        element.addEventListener("click", (): void => {
          const count = Number(element.getAttribute("data-test-click-count"));
          element.setAttribute("data-test-click-count", String(count + 1));
        });
      });
      if (input === "touch") await toggle.tap();
      else await toggle.click();
      await expect(toggle).toHaveAttribute("data-test-click-count", "1");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-preference",
        "reduced",
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      expect(
        await page.evaluate((key) => localStorage.getItem(key), PREFERENCE_KEY),
      ).toBe("reduced");
      await expect(page.locator(".site-header")).not.toHaveAttribute(
        "data-menu-motion",
        /.+/u,
      );
      await closeConsumerMotionControls(page);
    });
  });
}
