import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import type { SupportedLocale } from "../../../src/config/site";

const DUEL_PRODUCTS = ["original", "lychee-pear"] as const;
const PRODUCT_QUERY = DUEL_PRODUCTS.join(",");
const FALLBACK_PRODUCT_COUNT = 5;
const SELECTED_PRODUCT = "[data-compare-product]:not([hidden])";

/** Follow the real preview pair, including its canonical query and progressive fallback. */
export async function openTypographyDuelCompare(
  page: Page,
  options: {
    readonly locale: SupportedLocale;
    readonly mode: "reduced" | "no-js";
  },
): Promise<void> {
  const arena = page.locator(".home-duel__arena");
  const href = await arena.getAttribute("href");
  if (href === null) throw new Error("Duel must expose a native Compare href.");
  const destination = new URL(href, page.url());
  expect(destination.pathname.endsWith(`/${options.locale}/compare/`)).toBe(
    true,
  );
  expect(destination.searchParams.get("products")).toBe(PRODUCT_QUERY);
  await arena.focus();
  await expect(arena).toBeFocused();
  await arena.press("Enter");
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === destination.pathname &&
      url.searchParams.get("products") === PRODUCT_QUERY,
  );
  await expect(page.locator("[data-compare-root]")).toBeVisible();
  if (options.mode === "no-js") {
    await expect(page.locator("[data-compare-fallback]")).toBeVisible();
    await expect(
      page.locator("[data-compare-matrix] thead [data-product-slug]"),
    ).toHaveCount(FALLBACK_PRODUCT_COUNT);
    return;
  }
  await expect(page.locator("[data-compare-root]")).toHaveAttribute(
    "data-compare-enhanced",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(SELECTED_PRODUCT)
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("data-product-slug")),
        ),
    )
    .toEqual([...DUEL_PRODUCTS]);
}
