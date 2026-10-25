import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [320, 360, 390, 768] as const;
const PRODUCTS = ["original", "zero", "extra"] as const;
const EDGE_TOLERANCE_PX = 1;

test.use({ contextOptions: { reducedMotion: "reduce" } });

async function verifyUpperCanSeparation(page: Page): Promise<void> {
  const first = await page
    .locator('[data-compare-product][data-product-slug="original"] img')
    .boundingBox();
  const second = await page
    .locator('[data-compare-product][data-product-slug="zero"] img')
    .boundingBox();
  if (first === null || second === null)
    throw new Error("Both upper cans need visible bounds.");
  expect(first.x + first.width).toBeLessThanOrEqual(
    second.x + EDGE_TOLERANCE_PX,
  );
}

for (const width of WIDTHS) {
  test(`GIVEN three selected products at ${width}px WHEN mobile comparison rests THEN two upper cans fit completely inside the arena`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
    const response = await page.goto(
      `/uz/compare/?products=${PRODUCTS.join(",")}&motion=static`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);
    const arena = page.locator(".selected-products");
    await expect(page.locator("[data-compare-root]")).toHaveAttribute(
      "data-selection-count",
      "3",
    );
    const columns = await arena.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" "),
    );
    expect(columns).toHaveLength(2);
    const arenaBox = await arena.boundingBox();
    if (arenaBox === null)
      throw new Error("Comparison arena must have bounds.");
    for (const slug of PRODUCTS) {
      const image = page.locator(
        `[data-compare-product][data-product-slug="${slug}"] img`,
      );
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              element instanceof HTMLImageElement &&
              element.complete &&
              element.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const box = await image.boundingBox();
      if (box === null) throw new Error(`Missing visible can for ${slug}.`);
      expect(box.x).toBeGreaterThanOrEqual(arenaBox.x - EDGE_TOLERANCE_PX);
      expect(box.x + box.width).toBeLessThanOrEqual(
        arenaBox.x + arenaBox.width + EDGE_TOLERANCE_PX,
      );
    }
    await verifyUpperCanSeparation(page);
  });
}
