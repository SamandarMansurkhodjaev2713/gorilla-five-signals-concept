import { expect, test, type Page } from "@playwright/test";

import { waitForCompactFonts } from "./support/compact-fonts";

const LANDSCAPE_WIDTHS = [568, 768, 769, 844, 1024] as const;
const LANDSCAPE_HEIGHT = 390;
const PRODUCT_SLUGS = ["original", "zero", "extra"] as const;
const SELECTION_COUNTS = [1, 2, 3] as const;
const BORDER_TOLERANCE_PX = 2;

test.use({ contextOptions: { reducedMotion: "reduce" } });

async function verifyArenaEnd(page: Page, count: number): Promise<void> {
  const copies = page.locator(
    "[data-compare-product]:not([hidden]) .signal-channel__copy",
  );
  await expect(copies).toHaveCount(count);
  const arena = await page.locator(".selected-products").boundingBox();
  if (arena === null)
    throw new Error("Comparison arena must have visible bounds.");
  let finalContentBottom = Number.NEGATIVE_INFINITY;
  for (const copy of await copies.all()) {
    await expect(copy.locator("h2")).toContainText(/\S/u);
    await expect(copy.locator("a[href]")).toHaveCount(1);
    const bounds = await copy.boundingBox();
    if (bounds === null || bounds.height <= 0)
      throw new Error("Every selected product needs a visible copy block.");
    finalContentBottom = Math.max(finalContentBottom, bounds.y + bounds.height);
  }
  expect(arena.y + arena.height - finalContentBottom).toBeLessThanOrEqual(
    BORDER_TOLERANCE_PX,
  );
  expect(finalContentBottom).toBeLessThanOrEqual(arena.y + arena.height);
}

for (const width of LANDSCAPE_WIDTHS) {
  for (const count of SELECTION_COUNTS) {
    test(`GIVEN ${count} selected products at ${width}x390 WHEN landscape comparison renders THEN the arena ends with real product content instead of empty tracks`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: LANDSCAPE_HEIGHT });
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      const products = PRODUCT_SLUGS.slice(0, count).join(",");
      const response = await page.goto(
        `/uz/compare/?products=${products}&motion=static`,
        { waitUntil: "domcontentloaded" },
      );
      expect(response?.status()).toBe(200);
      await expect(page.locator("[data-compare-root]")).toHaveAttribute(
        "data-selection-count",
        String(count),
      );
      await waitForCompactFonts(page);
      await verifyArenaEnd(page, count);
    });
  }
}
