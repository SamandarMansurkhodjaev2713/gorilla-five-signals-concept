import { expect, test } from "@playwright/test";

import {
  HOME_RUNTIME_SCENE_IDS,
  collectRuntimeErrors,
  expectSemanticPage,
} from "./support/site";

const ENDURANCE_TEST_TIMEOUT_MS = 240_000;

test.describe("motion capability and lifecycle", () => {
  test.skip(({ browserName }) => browserName !== "chromium");
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
  });

  test("GIVEN reduced motion is requested WHEN the runtime starts THEN semantic content remains and the reduced tier wins", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectSemanticPage(page, "uz");

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(page.locator("[data-motion-scene='hero']")).toBeVisible();
  });

  test("GIVEN motion is active WHEN the visitor pauses it THEN the control exposes state and the preference survives reload", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectSemanticPage(page, "uz");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      /^(?:full|lite)$/,
    );

    const toggles = page.locator("[data-motion-toggle]");
    await expect(toggles).toHaveCount(1);
    await expect(toggles.first()).toHaveAttribute("aria-pressed", "false");
    await toggles.first().click();

    for (const toggle of await toggles.all()) {
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    }
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-preference",
      "reduced",
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(toggles.first()).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
  });

  test("GIVEN repeated navigation and resize WHEN scenes remount THEN scene identity stays unique and no runtime error is emitted", async ({
    page,
  }) => {
    test.setTimeout(ENDURANCE_TEST_TIMEOUT_MS);
    const errors = await collectRuntimeErrors(page);

    for (let cycle = 0; cycle < 20; cycle += 1) {
      const isCompact = cycle % 2 === 0;
      await page.setViewportSize(
        isCompact ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      );
      await expectSemanticPage(page, "uz");

      const sceneIds = await page
        .locator("[data-motion-scene]")
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("data-motion-scene")),
        );
      expect(sceneIds).toEqual([...HOME_RUNTIME_SCENE_IDS]);
      expect(new Set(sceneIds).size).toBe(sceneIds.length);

      await expectSemanticPage(page, "uz", "/products/original");
    }

    expect(errors).toEqual([]);
  });

  test("GIVEN data saver is active WHEN the runtime starts THEN Lite choreography is selected without hiding content", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: { saveData: true },
      });
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectSemanticPage(page, "uz");

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "lite",
    );
    await expect(page.locator("[data-product-card]")).toHaveCount(5);
  });

  test("GIVEN Full motion WHEN product choices change rapidly THEN exactly one semantic selection survives without runtime errors", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "full"),
    );
    await expectSemanticPage(page, "uz");
    const explorer = page.locator("[data-product-explorer]");
    const selectors = explorer.locator("[data-product-selector]");

    for (const index of [1, 4, 2, 3, 0, 4]) {
      await selectors.nth(index).click();
    }

    await expect(explorer).toHaveAttribute(
      "data-selected-product",
      "lychee-pear",
    );
    await expect(
      explorer.locator('[data-product-selector][aria-pressed="true"]'),
    ).toHaveCount(1);
    await expect(
      explorer.locator("[data-product-card][data-motion-selected]"),
    ).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("GIVEN product media fails WHEN the page renders THEN text, actions, and responsible information degrade gracefully", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.route("**/media/generated/**", (route) => route.abort());
    await expectSemanticPage(page, "uz", "/products/original");

    await expect(page.locator("h1")).toContainText("Asl");
    await expect(page.locator(".product-heading .control")).toBeVisible();
    await expect(page.locator(".warning-panel")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator(".can-stage img")
          .evaluate((image) =>
            image instanceof HTMLImageElement ? image.naturalWidth : -1,
          ),
      )
      .toBe(0);
    expect(errors).not.toEqual([]);
    expect(
      errors.filter((error) => !error.includes("net::ERR_FAILED")),
    ).toEqual([]);
  });
});
