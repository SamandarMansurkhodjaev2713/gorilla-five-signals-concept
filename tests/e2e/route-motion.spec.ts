import { expect, test } from "@playwright/test";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const ROUTE_CONTRACTS = [
  {
    hooks: [["[data-motion-culture-chapter]", 5]],
    scene: "culture-atlas",
    suffix: "/culture",
  },
  {
    hooks: [
      ["[data-motion-find-field]", 1],
      ["[data-motion-find-marker]", 1],
      ["[data-motion-find-visual]", 5],
    ],
    scene: "find-handoff",
    suffix: "/find",
  },
  {
    hooks: [["[data-motion-contact-rail]", 5]],
    scene: "contact-switchboard",
    suffix: "/contact",
  },
] as const;

test.describe("route-specific motion contracts", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
  });

  test("GIVEN editorial routes WHEN each scene mounts THEN unique hooks and readable geometry survive", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    for (const viewport of [
      { height: 844, width: 390 },
      { height: 900, width: 1440 },
    ]) {
      await page.setViewportSize(viewport);
      for (const contract of ROUTE_CONTRACTS) {
        await expectSemanticPage(page, "uz", contract.suffix);
        const scene = page.locator(`[data-motion-scene="${contract.scene}"]`);
        await expect(scene).toHaveCount(1);
        for (const [selector, count] of contract.hooks) {
          await expect(scene.locator(selector)).toHaveCount(count);
        }
        await expectNoHorizontalOverflow(page);
      }
    }
    expect(errors).toEqual([]);
  });

  for (const preference of ["system", "user"] as const) {
    test(`GIVEN ${preference} Reduced Motion WHEN locator selection changes THEN semantic state is immediate and spatial transitions stay disabled`, async ({
      page,
    }) => {
      const errors = await collectRuntimeErrors(page);
      await page.emulateMedia({
        reducedMotion: preference === "system" ? "reduce" : "no-preference",
      });
      if (preference === "user") {
        await page.addInitScript(() =>
          localStorage.setItem("gorilla:motion-preference:v1", "reduced"),
        );
      }
      await expectSemanticPage(page, "uz", "/find");
      const locator = page.locator("[data-locator-handoff]");
      await locator.locator("[data-locator-product]").selectOption("extra");

      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expect(locator).toHaveAttribute("data-flavor", "extra");
      await expect(
        locator.locator("[data-locator-product-visual]:not([hidden])"),
      ).toHaveCount(1);
      const transitionDurations = await locator
        .locator("[data-locator-signal], [data-locator-product-visual]")
        .evaluateAll((elements) =>
          elements.map(
            (element) => getComputedStyle(element).transitionDuration,
          ),
        );
      expect(new Set(transitionDurations)).toEqual(new Set(["0s"]));
      expect(errors).toEqual([]);
    });
  }

  test("GIVEN Full motion WHEN locator choices race and the visitor pauses THEN final state wins and GSAP ownership is reverted", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "full"),
    );
    await expectSemanticPage(page, "uz", "/find");
    const locator = page.locator("[data-locator-handoff]");
    const select = locator.locator("[data-locator-product]");

    for (const slug of [
      "original",
      "zero",
      "extra",
      "mango-coconut",
      "lychee-pear",
    ]) {
      await select.selectOption(slug);
    }
    await expect(locator).toHaveAttribute("data-flavor", "lychee-pear");
    await expect(
      locator.locator("[data-locator-product-visual]:not([hidden])"),
    ).toHaveAttribute("data-locator-product-visual", "lychee-pear");

    await page.locator("[data-motion-toggle]").first().click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    const inlineTransforms = await locator
      .locator("[data-motion-find-visual], [data-locator-google]")
      .evaluateAll((elements) =>
        elements.map((element) =>
          element instanceof HTMLElement ? element.style.transform : "invalid",
        ),
      );
    expect(inlineTransforms.every((value) => value === "")).toBe(true);
    expect(errors).toEqual([]);
  });
});
