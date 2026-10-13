import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const CAPTURE_DIRECTORY = resolve(".tmp/product-atlas");
const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const CAPTURE_VIEWPORTS = [
  { height: 800, label: "phone-360", width: 360 },
  { height: 844, label: "phone-390", width: 390 },
  { height: 1024, label: "tablet-768", width: 768 },
  { height: 768, label: "tablet-landscape-1024", width: 1024 },
  { height: 900, label: "desktop-1440", width: 1440 },
  { height: 1080, label: "wide-1920", width: 1920 },
  { height: 390, label: "phone-landscape-844", width: 844 },
] as const;
const SHOWCASE_VIEWPORTS = [
  { height: 844, label: "phone-390", width: 390 },
  { height: 900, label: "desktop-1440", width: 1440 },
] as const;
const PRODUCT_SLUGS = [
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
] as const;

test("capture the authored Product Atlas across the required viewport matrix", async ({
  page,
}) => {
  await mkdir(CAPTURE_DIRECTORY, { recursive: true });
  await page.addInitScript(({ key }) => sessionStorage.setItem(key, "true"), {
    key: CONFIRMATION_KEY,
  });

  for (const viewport of CAPTURE_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.goto("/uz/products/");
    await expect(page.locator("[data-atlas-root]")).toHaveAttribute(
      "data-atlas-enhanced",
      "true",
    );
    await page.screenshot({
      path: resolve(CAPTURE_DIRECTORY, `${viewport.label}-hero.png`),
    });

    const chapter = page.locator(
      '[data-atlas-panel][data-product-slug="original"]',
    );
    await page
      .locator('[data-atlas-link][data-product-slug="original"]')
      .click();
    await expect
      .poll(() =>
        chapter
          .locator(".archive-chapter__visual img")
          .evaluate(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: resolve(CAPTURE_DIRECTORY, `${viewport.label}-chapter.png`),
    });
  }
});

test("capture all five authored frequency worlds on desktop and mobile", async ({
  page,
}) => {
  await mkdir(CAPTURE_DIRECTORY, { recursive: true });
  await page.addInitScript(({ key }) => sessionStorage.setItem(key, "true"), {
    key: CONFIRMATION_KEY,
  });

  for (const viewport of SHOWCASE_VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const slug of PRODUCT_SLUGS) {
      await page.goto(`/uz/products/#signal-${slug}`);
      const panel = page.locator(
        `[data-atlas-panel][data-product-slug="${slug}"]`,
      );
      await expect(panel).toHaveAttribute("data-active", "");
      await expect
        .poll(() =>
          panel
            .locator(".archive-chapter__visual img")
            .evaluate(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
        )
        .toBe(true);
      await page.screenshot({
        path: resolve(CAPTURE_DIRECTORY, `${viewport.label}-${slug}.png`),
      });
    }
  }
});
