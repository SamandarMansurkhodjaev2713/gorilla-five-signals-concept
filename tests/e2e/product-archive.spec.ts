import { expect, test } from "@playwright/test";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  PRODUCT_SLUGS,
} from "./support/site";

const DESKTOP_VIEWPORT = { height: 900, width: 1440 } as const;
const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;
const APPLICATION_ORIGIN = "http://127.0.0.1:4321";
const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";

test.describe("vertical product frequency archive", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, "true"), {
      key: CONFIRMATION_KEY,
    });
  });

  test("GIVEN a desktop deep link WHEN the archive loads THEN five products remain visible in a sticky collection wall", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/uz/products/#signal-extra");

    const root = page.locator("[data-atlas-root]");
    const wallItems = root.locator("[data-atlas-link]");
    const chapters = root.locator("[data-atlas-panel]");

    await expect(root).toHaveAttribute("data-atlas-enhanced", "true");
    await expect(root).toHaveAttribute("data-selected-product", "extra");
    await expect(wallItems).toHaveCount(PRODUCT_SLUGS.length);
    await expect(chapters).toHaveCount(PRODUCT_SLUGS.length);
    await expect(wallItems.locator("img")).toHaveCount(PRODUCT_SLUGS.length);
    await expect
      .poll(() =>
        wallItems
          .locator("img")
          .evaluateAll((images) =>
            images.every((image) => image.getBoundingClientRect().height > 0),
          ),
      )
      .toBe(true);
    await expect(
      root.locator('[data-atlas-link][aria-current="location"]'),
    ).toHaveAttribute("data-product-slug", "extra");
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
    await expect(
      root.locator('[role="tablist"], [role="tabpanel"]'),
    ).toHaveCount(0);
    await expect(
      root.locator("[data-atlas-next], [data-atlas-previous]"),
    ).toHaveCount(0);
    await expect(root.locator(".archive-scan__sticky")).toHaveCSS(
      "position",
      "sticky",
    );
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test("GIVEN keyboard navigation WHEN an adjacent frequency is requested THEN focus, hash, and scan state move without hiding chapters", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/uz/products/#signal-original");
    const root = page.locator("[data-atlas-root]");
    const original = root.locator(
      '[data-atlas-link][data-product-slug="original"]',
    );
    const zero = root.locator('[data-atlas-link][data-product-slug="zero"]');

    await original.focus();
    await page.keyboard.press("ArrowDown");

    await expect(zero).toBeFocused();
    await expect(page).toHaveURL(/#signal-zero$/u);
    await expect(root).toHaveAttribute("data-selected-product", "zero");
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
  });

  test("GIVEN native scrolling WHEN a later chapter crosses the scan line THEN the URL and wall state follow it", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/uz/products/#signal-original");
    const root = page.locator("[data-atlas-root]");
    const chapter = root.locator(
      '[data-atlas-panel][data-product-slug="mango-coconut"]',
    );

    await chapter.scrollIntoViewIfNeeded();

    await expect(root).toHaveAttribute(
      "data-selected-product",
      "mango-coconut",
    );
    await expect(page).toHaveURL(/#signal-mango-coconut$/u);
    await expect(
      root.locator('[data-atlas-panel][data-active=""]'),
    ).toHaveAttribute("data-product-slug", "mango-coconut");
  });

  test("GIVEN a mobile viewport WHEN the archive is read THEN all five cards stay in the native vertical flow", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/uz/products/");
    const root = page.locator("[data-atlas-root]");
    const chapters = root.locator("[data-atlas-panel]");

    await expect(chapters).toHaveCount(PRODUCT_SLUGS.length);
    await expect(
      chapters.locator(".archive-chapter__mobile-product"),
    ).toHaveCount(PRODUCT_SLUGS.length);
    await expect
      .poll(() =>
        chapters
          .locator(".archive-chapter__mobile-product")
          .evaluateAll((elements) =>
            elements.every(
              (element) => element.getBoundingClientRect().height > 0,
            ),
          ),
      )
      .toBe(true);
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
    await expect(root.locator(".archive-scan__sticky")).toHaveCSS(
      "position",
      "relative",
    );
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(documentHeight).toBeGreaterThan(MOBILE_VIEWPORT.height * 5);
    await expectNoHorizontalOverflow(page);
  });

  test("GIVEN JavaScript is unavailable WHEN the products page renders THEN anchor deep links and every chapter remain available", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: MOBILE_VIEWPORT,
    });
    const page = await context.newPage();
    await page.goto(`${APPLICATION_ORIGIN}/uz/products/#signal-lychee-pear`);
    const root = page.locator("[data-atlas-root]");

    await expect(root).not.toHaveAttribute("data-atlas-enhanced", "true");
    await expect(root.locator("[data-atlas-panel]")).toHaveCount(
      PRODUCT_SLUGS.length,
    );
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
    await expect(
      root.locator('[data-atlas-link][data-product-slug="lychee-pear"]'),
    ).toHaveAttribute("href", "#signal-lychee-pear");
    await expectNoHorizontalOverflow(page);
    await context.close();
  });

  test("GIVEN reduced motion WHEN archive state changes THEN content stays complete and transitions are removed", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/uz/products/#signal-zero");
    const root = page.locator("[data-atlas-root]");

    await expect(root).toHaveAttribute("data-selected-product", "zero");
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
    const motionState = await root.evaluate((element) => {
      const scan = element.querySelector(".archive-wall");
      const copy = element.querySelector(".archive-chapter__copy");
      if (scan === null || copy === null) return null;
      return {
        animationName: getComputedStyle(copy).animationName,
        transitionDuration: getComputedStyle(scan, "::after")
          .transitionDuration,
      };
    });

    expect(motionState).not.toBeNull();
    expect(motionState?.animationName).toBe("none");
    expect(
      motionState?.transitionDuration
        .split(", ")
        .every((value) => value === "0s"),
    ).toBe(true);
  });
});
