import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { PRODUCT_SLUGS } from "../../src/features/product-detail/product-world-contract";

const GRAIN_PATH = "/media/generated/material/material-grain-v1.png";
const SURFACES = [
  { route: "/uz/", selector: ".hero.material-grain" },
  { route: "/uz/products/original/", selector: ".product-hero.material-grain" },
] as const;
const WIDTHS = [390, 1440] as const;
const ASSET_REQUEST_TIMEOUT_MS = 7500;

test.use({
  contextOptions: { javaScriptEnabled: false, reducedMotion: "reduce" },
});

async function verifyMaterialLayer(
  page: Page,
  selector: string,
): Promise<string> {
  const material = page.locator(selector);
  await material.scrollIntoViewIfNeeded();
  const styles = await material.evaluate((element) => {
    const grain = getComputedStyle(element, "::after");
    return {
      image: grain.backgroundImage,
      opacity: grain.opacity,
      pointer: grain.pointerEvents,
      repeat: grain.backgroundRepeat,
      isolation: getComputedStyle(element).isolation,
    };
  });
  expect(styles.image).toMatch(/^url\(/u);
  expect(styles.image).toContain(GRAIN_PATH);
  expect(styles).toMatchObject({
    opacity: "0.035",
    pointer: "none",
    repeat: "repeat",
    isolation: "isolate",
  });
  return styles.image;
}

async function verifyTextureBytes(page: Page, image: string): Promise<void> {
  const value = /^url\(["']?([^"')]+)["']?\)$/u.exec(image)?.[1];
  if (value === undefined)
    throw new Error("Material grain needs one native image URL.");
  const assetUrl = new URL(value, page.url());
  expect(assetUrl.origin).toBe(new URL(page.url()).origin);
  const response = await page.request.get(assetUrl.href, {
    timeout: ASSET_REQUEST_TIMEOUT_MS,
  });
  expect(response.status()).toBe(200);
  expect(await response.body()).toEqual(
    await readFile(path.resolve(`public${GRAIN_PATH}`)),
  );
}

for (const surface of SURFACES) {
  for (const width of WIDTHS) {
    test(`GIVEN native ${surface.route} at ${width}px WHEN material grain paints THEN one verified neutral texture preserves noninteractive layering`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const loadedStatuses: number[] = [];
      page.on("response", (response) => {
        if (new URL(response.url()).pathname.endsWith(GRAIN_PATH))
          loadedStatuses.push(response.status());
      });
      await page.goto(surface.route, { waitUntil: "domcontentloaded" });
      const image = await verifyMaterialLayer(page, surface.selector);
      await expect.poll(() => loadedStatuses).toEqual([200]);
      await verifyTextureBytes(page, image);
    });
  }
}

test("GIVEN forced colors WHEN the material surface renders THEN decorative grain stays removed", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/uz/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".hero.material-grain")).toBeVisible();
  expect(
    await page
      .locator(".hero.material-grain")
      .evaluate((element) => getComputedStyle(element, "::after").display),
  ).toBe("none");
});

for (const slug of PRODUCT_SLUGS) {
  test(`GIVEN ${slug} world WHEN its material paints THEN grain is shared without a second moving blend layer`, async ({
    page,
  }) => {
    await page.goto(`/uz/products/${slug}/`, { waitUntil: "domcontentloaded" });
    const art = page.locator(".product-world-art");
    await expect(art).toHaveCount(1);
    expect(
      await art.evaluate(
        (element) => getComputedStyle(element, "::after").content,
      ),
    ).toBe("none");
    await verifyMaterialLayer(page, ".product-hero.material-grain");
  });
}
