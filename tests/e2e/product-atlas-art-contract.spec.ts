import { expect, test } from "@playwright/test";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  PRODUCT_SLUGS,
} from "./support/site";

const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const VIEWPORTS = [
  { height: 800, width: 360 },
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 768, width: 1024 },
  { height: 900, width: 1440 },
  { height: 1080, width: 1920 },
  { height: 390, width: 844 },
] as const;

test.describe("authored product signal atlas", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, "true"), {
      key: CONFIRMATION_KEY,
    });
  });

  for (const viewport of VIEWPORTS) {
    test(`GIVEN the ${String(viewport.width)}x${String(viewport.height)} viewport WHEN the atlas renders THEN five complete chapters remain readable`, async ({
      page,
    }) => {
      const errors = await collectRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await page.goto("/uz/products/#signal-original");
      const root = page.locator("[data-atlas-root]");

      await expect(root).toHaveAttribute("data-atlas-enhanced", "true");
      await expect(root.locator("[data-atlas-link]")).toHaveCount(
        PRODUCT_SLUGS.length,
      );
      await expect(root.locator("[data-atlas-panel]")).toHaveCount(
        PRODUCT_SLUGS.length,
      );
      await expect(root.locator("[data-atlas-visual]")).toHaveCount(
        PRODUCT_SLUGS.length,
      );
      await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
      await expect
        .poll(() =>
          root
            .locator('[data-atlas-panel][data-product-slug="original"]')
            .evaluate((panel) => panel.getBoundingClientRect().top),
        )
        .toBeGreaterThanOrEqual(0);
      await expect
        .poll(() =>
          root.locator("[data-atlas-link]").evaluateAll((links) =>
            links.every((link) => {
              const box = link.getBoundingClientRect();
              return box.width >= 44 && box.height >= 44;
            }),
          ),
        )
        .toBe(true);

      const clippedText = await root
        .locator(
          ".archive-wall strong, .archive-chapter__copy h2, .archive-chapter__description, .archive-chapter__warning",
        )
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const style = getComputedStyle(element);
              return (
                style.display !== "none" &&
                element.scrollWidth > element.clientWidth + 1
              );
            })
            .map((element) => element.textContent?.trim().slice(0, 64)),
        );

      expect(clippedText).toEqual([]);
      expect(errors).toEqual([]);

      const extra = root.locator(
        '[data-atlas-link][data-product-slug="extra"]',
      );
      await extra.click();
      await expect(page).toHaveURL(/#signal-extra$/u);
      await expect(root).toHaveAttribute("data-selected-product", "extra");
      const alignment = await root.evaluate((element) => {
        const target = element.querySelector<HTMLElement>(
          '[data-atlas-panel][data-product-slug="extra"]',
        );
        const previous = element.querySelector<HTMLElement>(
          '[data-atlas-panel][data-product-slug="zero"]',
        );
        const scan = element.querySelector<HTMLElement>(".archive-scan");
        const instrument = element.querySelector<HTMLElement>(
          ".archive-scan__sticky",
        );
        if (
          target === null ||
          previous === null ||
          scan === null ||
          instrument === null
        ) {
          return null;
        }
        const scrollPadding = Number.parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingBlockStart,
        );
        const expectedTop =
          getComputedStyle(scan).position === "sticky"
            ? instrument.getBoundingClientRect().bottom
            : scrollPadding;
        return {
          expectedTop,
          previousBottom: previous.getBoundingClientRect().bottom,
          targetTop: target.getBoundingClientRect().top,
        };
      });
      expect(alignment).not.toBeNull();
      expect(
        Math.abs((alignment?.targetTop ?? 0) - (alignment?.expectedTop ?? 0)),
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(
          (alignment?.previousBottom ?? 0) - (alignment?.expectedTop ?? 0),
        ),
      ).toBeLessThanOrEqual(2);

      if (viewport.width <= 390) {
        const minimumNavFontSize = await root
          .locator(".archive-wall strong")
          .evaluateAll((labels) =>
            Math.min(
              ...labels.map((label) =>
                Number.parseFloat(getComputedStyle(label).fontSize),
              ),
            ),
          );
        expect(minimumNavFontSize).toBeGreaterThanOrEqual(12);
      }
      if (viewport.width === 844 && viewport.height === 390) {
        await expect(root.locator(".archive-scan")).toHaveCSS(
          "position",
          "relative",
        );
      }
      await expectNoHorizontalOverflow(page);
    });
  }

  test("GIVEN keyboard and pointer input WHEN frequencies change THEN focus, hash, history, and chapter state stay synchronized", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await page.goto("/uz/products/#signal-original");
    const root = page.locator("[data-atlas-root]");
    const original = root.locator(
      '[data-atlas-link][data-product-slug="original"]',
    );
    const zero = root.locator('[data-atlas-link][data-product-slug="zero"]');
    const extra = root.locator('[data-atlas-link][data-product-slug="extra"]');

    await original.focus();
    await page.keyboard.press("ArrowRight");
    await expect(zero).toBeFocused();
    await expect(page).toHaveURL(/#signal-zero$/u);
    await expect(root).toHaveAttribute("data-selected-product", "zero");

    await extra.click();
    await expect(page).toHaveURL(/#signal-extra$/u);
    await expect(root).toHaveAttribute("data-selected-product", "extra");
    await page.goBack();
    await expect(root).toHaveAttribute("data-selected-product", "zero");
  });

  test("GIVEN rapid explicit intents WHEN the atlas settles THEN only the final chapter updates selection, hash, status, and live events", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 390, width: 844 });
    await page.goto("/uz/products/#signal-original");
    const root = page.locator("[data-atlas-root]");
    await expect(root).toHaveAttribute("data-selected-product", "original");
    await root.evaluate((element) => {
      element.dataset.selectionEventCount = "0";
      element.dataset.selectionEventSlugs = "";
      element.addEventListener("gorilla:selection-change", () => {
        const count = Number.parseInt(
          element.dataset.selectionEventCount ?? "0",
          10,
        );
        element.dataset.selectionEventCount = String(count + 1);
        element.dataset.selectionEventSlugs = [
          element.dataset.selectionEventSlugs,
          element.dataset.selectedProduct,
        ]
          .filter(Boolean)
          .join(",");
      });
      element
        .querySelector<HTMLAnchorElement>(
          '[data-atlas-link][data-product-slug="zero"]',
        )
        ?.click();
      element
        .querySelector<HTMLAnchorElement>(
          '[data-atlas-link][data-product-slug="extra"]',
        )
        ?.click();
    });

    await expect(page).toHaveURL(/#signal-extra$/u);
    await expect(root).toHaveAttribute("data-selected-product", "extra");
    await expect(root).toHaveAttribute("data-selection-event-count", "1");
    await expect(root).toHaveAttribute("data-selection-event-slugs", "extra");
    await expect(root.locator("[data-atlas-status]")).toContainText(
      "EXTRA · 03 / 05",
    );
    await expect(
      root.locator('[data-atlas-link][aria-current="location"]'),
    ).toHaveCount(1);
    await expect(
      root.locator(
        '[data-atlas-link][data-product-slug="extra"][aria-current="location"]',
      ),
    ).toHaveCount(1);

    await root.locator('[data-atlas-link][data-product-slug="extra"]').click();
    await expect(root).toHaveAttribute("data-selection-event-count", "1");
  });

  test("GIVEN a touch viewport WHEN a frequency is tapped THEN the native deep link and selected chapter remain synchronized", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { height: 844, width: 390 },
    });
    await context.addInitScript(
      ({ key }) => sessionStorage.setItem(key, "true"),
      { key: CONFIRMATION_KEY },
    );
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4321/uz/products/#signal-original");
    const root = page.locator("[data-atlas-root]");

    await root
      .locator('[data-atlas-link][data-product-slug="mango-coconut"]')
      .tap();
    await expect(page).toHaveURL(/#signal-mango-coconut$/u);
    await expect(root).toHaveAttribute(
      "data-selected-product",
      "mango-coconut",
    );
    await expect(root.locator(".archive-scan")).toHaveCSS(
      "position",
      "relative",
    );
    await expectNoHorizontalOverflow(page);
    await context.close();
  });

  for (const locale of ["en", "ru", "uz"] as const) {
    test(`GIVEN the ${locale} locale WHEN a deep link opens THEN the selected product and direct task exits are intact`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/products/#signal-lychee-pear`);
      const root = page.locator("[data-atlas-root]");
      const panel = root.locator(
        '[data-atlas-panel][data-product-slug="lychee-pear"]',
      );

      await expect(root).toHaveAttribute(
        "data-selected-product",
        "lychee-pear",
      );
      await expect(
        panel.locator(`a[href="/${locale}/products/lychee-pear/"]`),
      ).toHaveCount(1);
      await expect(panel.locator(`a[href^="/${locale}/compare/"]`)).toHaveCount(
        1,
      );
    });
  }

  test("GIVEN JavaScript is disabled WHEN a hash route opens THEN native anchors and all product chapters remain available", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { height: 844, width: 390 },
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4321/uz/products/#signal-mango-coconut");
    const root = page.locator("[data-atlas-root]");

    await expect(root).not.toHaveAttribute("data-atlas-enhanced", "true");
    await expect(root.locator("[data-atlas-panel]")).toHaveCount(
      PRODUCT_SLUGS.length,
    );
    await expect(root.locator("[data-atlas-panel][hidden]")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await context.close();
  });

  test("GIVEN reduced motion WHEN the atlas renders THEN spatial animations are disabled without losing content", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/uz/products/#signal-extra");
    const root = page.locator("[data-atlas-root]");
    const motionState = await root.evaluate((element) => {
      const image = element.querySelector(".archive-chapter__visual img");
      const wall = element.querySelector(".archive-wall");
      return image === null || wall === null
        ? null
        : {
            animationName: getComputedStyle(image).animationName,
            transitionDuration: getComputedStyle(wall, "::after")
              .transitionDuration,
          };
    });

    expect(motionState?.animationName).toBe("none");
    expect(motionState?.transitionDuration).toBe("0s");
    await expect(root.locator(".archive-scan")).toHaveCSS(
      "position",
      "relative",
    );
    await expect(root.locator("[data-atlas-panel]")).toHaveCount(
      PRODUCT_SLUGS.length,
    );
  });
});
