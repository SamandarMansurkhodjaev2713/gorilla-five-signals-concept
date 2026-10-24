import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const WIDTHS = [390, 1440] as const;
const MATERIAL_SELECTOR =
  '.product-detail[data-flavor="original"] .original-metal';

test.use({
  contextOptions: { javaScriptEnabled: false, reducedMotion: "reduce" },
});

async function verifyMetalLighting(page: Page): Promise<void> {
  const metal = page.locator(MATERIAL_SELECTOR);
  await expect(metal).toHaveCount(1);
  const style = await metal.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundImage,
      shadow: computed.boxShadow,
      clip: computed.clipPath,
      transform: computed.transform,
    };
  });
  expect(style.shadow).toBe("none");
  expect(
    style.background.match(/(?:repeating-)?linear-gradient\(/gu),
  ).toHaveLength(3);
  expect(style.background).toContain("rgba(0, 0, 0, 0.6)");
  expect(style.background).toContain("repeating-linear-gradient(93deg");
  expect(style.background).toContain("linear-gradient(112deg");
  expect(style.clip).toMatch(/^polygon\(/u);
  expect(style.transform).toMatch(/^matrix\(/u);
  const droplets = page.locator(`${MATERIAL_SELECTOR} .original-metal__wet`);
  await expect(droplets).toHaveCount(2);
  expect(
    await droplets
      .first()
      .evaluate((element) => getComputedStyle(element).boxShadow),
  ).not.toBe("none");
}

for (const width of WIDTHS) {
  test(`GIVEN Original at ${width}px WHEN native material renders THEN local shading preserves metal layers without a blurred slab shadow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/uz/products/original/", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    await verifyMetalLighting(page);
    expect(
      await page
        .locator(".product-hero")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
  });
}
