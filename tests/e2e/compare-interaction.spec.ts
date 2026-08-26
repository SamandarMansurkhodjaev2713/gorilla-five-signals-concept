import { expect, test } from "@playwright/test";

import {
  PRODUCT_SLUGS,
  acceptResponsibleEntry,
  collectRuntimeErrors,
  expectSemanticPage,
} from "./support/site";

const ROOT = "[data-compare-root]";
const SELECT = "[data-compare-slot]";
const SELECTED_PRODUCT = "[data-compare-product]:not([hidden])";

async function selectedSlugs(
  page: Parameters<typeof expectSemanticPage>[0],
): Promise<readonly string[]> {
  return page.locator(SELECTED_PRODUCT).evaluateAll((elements) =>
    elements.flatMap((element) => {
      const slug = element.getAttribute("data-product-slug");
      return slug ? [slug] : [];
    }),
  );
}

async function openConfirmedCompare(
  page: Parameters<typeof expectSemanticPage>[0],
  locale: "en" | "ru" | "uz",
  suffix: string,
): Promise<void> {
  await expectSemanticPage(page, locale, suffix);
  await acceptResponsibleEntry(page);
}

test.describe("compare progressive enhancement", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN desktop compare WHEN slots change THEN selection is shareable and reload-safe", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openConfirmedCompare(page, "uz", "/compare/");

    await expect(page.locator(ROOT)).toHaveAttribute(
      "data-compare-enhanced",
      "true",
    );
    await expect(page.locator(SELECT)).toHaveCount(3);
    await expect(page.locator(SELECT).nth(2)).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("products"))
      .toBe("original,zero");

    await page.locator(SELECT).nth(2).selectOption("extra");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("products"))
      .toBe("original,zero,extra");
    await expect
      .poll(() => selectedSlugs(page))
      .toEqual(["original", "zero", "extra"]);

    await page.locator(SELECT).nth(1).selectOption("mango-coconut");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("products"))
      .toBe("original,mango-coconut,extra");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect
      .poll(() => selectedSlugs(page))
      .toEqual(["original", "mango-coconut", "extra"]);
    expect(errors).toEqual([]);
  });

  test("GIVEN a compact viewport WHEN a three-product URL opens THEN the experience is bounded to two accessible slots", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConfirmedCompare(
      page,
      "uz",
      "/compare/?products=original,zero,extra",
    );

    await expect(
      page.locator("[data-compare-slot-wrapper]:visible"),
    ).toHaveCount(2);
    await expect(page.locator(SELECT).nth(2)).toBeDisabled();
    await expect.poll(() => selectedSlugs(page)).toEqual(["original", "zero"]);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("products"))
      .toBe("original,zero");

    const undersized = await page
      .locator(
        `${ROOT} select:visible, ${ROOT} button:visible, ${ROOT} a:visible`,
      )
      .evaluateAll(
        (elements) =>
          elements.filter((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.width < 44 || bounds.height < 44;
          }).length,
      );
    expect(undersized).toBe(0);
  });

  test("GIVEN compare actions WHEN selection is cleared or restored THEN empty and locator outcomes are real", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openConfirmedCompare(page, "uz", "/compare/?products=lychee-pear");

    await expect(page.locator("[data-compare-find]")).toHaveAttribute(
      "href",
      "/uz/find/?product=lychee-pear",
    );
    await page.locator("[data-compare-clear]").click();
    await expect(page.locator(SELECTED_PRODUCT)).toHaveCount(0);
    await expect(page.locator("[data-compare-empty]")).toBeVisible();
    await expect(page.locator("[data-compare-find]")).toHaveAttribute(
      "href",
      "/uz/find/",
    );
    await expect
      .poll(() => new URL(page.url()).searchParams.get("products"))
      .toBe("");
    await expect(page.locator(SELECT).first()).toBeFocused();

    await page.locator(SELECT).first().selectOption("mango-coconut");
    await expect(page.locator("[data-compare-find]")).toHaveAttribute(
      "href",
      "/uz/find/?product=mango-coconut",
    );
  });

  test("GIVEN any locale WHEN compare is enhanced THEN control copy is localized", async ({
    page,
  }) => {
    const legends = {
      en: "Choose products to compare",
      ru: "Выберите продукты для сравнения",
      uz: "Taqqoslash uchun mahsulotlarni tanlang",
    } as const;

    for (const locale of ["en", "ru", "uz"] as const) {
      const legend = legends[locale];
      await openConfirmedCompare(page, locale, "/compare/");
      await expect(page.locator(".selector-panel legend")).toHaveText(legend);
    }
  });

  test("GIVEN clipboard permission WHEN copy is activated THEN the canonical comparison URL is copied", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4321",
    });
    await openConfirmedCompare(page, "en", "/compare/?products=original,extra");
    await page.locator("[data-compare-copy]").click();
    await expect(page.locator("[data-compare-status]")).toHaveText(
      "The comparison link was copied.",
    );

    const copiedUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(copiedUrl).searchParams.get("products")).toBe(
      "original,extra",
    );
  });
});

test.describe("compare no-JavaScript baseline", () => {
  test.use({ javaScriptEnabled: false });

  test("GIVEN JavaScript is unavailable WHEN compare opens THEN every product and verified editorial dimension remains readable", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz", "/compare/");

    await expect(page.locator("[data-compare-enhanced]")).toBeHidden();
    await expect(
      page.locator("[data-compare-fallback] thead th[data-product-slug]"),
    ).toHaveCount(PRODUCT_SLUGS.length);
    await expect(page.locator("[data-compare-fallback] tbody tr")).toHaveCount(
      6,
    );
    await expect(
      page.locator("[data-compare-fallback] a[href*='/products/']"),
    ).toHaveCount(PRODUCT_SLUGS.length);
    await expect(page.locator("[data-compare-fallback]")).toContainText(
      "Hali tasdiqlanmagan",
    );
  });
});
