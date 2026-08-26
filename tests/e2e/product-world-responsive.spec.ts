import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  localizedPath,
  PRODUCT_SLUGS,
} from "./support/site";

const COMPACT_VIEWPORT = { height: 800, width: 360 } as const;
const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;
const MINIMUM_HERO_HEIGHT_PX = 720;
const MINIMUM_PHYSICAL_LAYERS = 4;
const MINIMUM_TARGET_PX = 44;
const MANGO_WARM_COPY_RATIO = 0.72;

async function openWorld(page: Page, slug: string): Promise<Locator> {
  await page.goto(localizedPath("uz", `/products/${slug}`));
  const world = page.locator("[data-product-world]");
  await expect(world).toHaveAttribute("data-product-world", slug);
  return world;
}

async function expectHeroGeometry(world: Locator): Promise<void> {
  const geometry = await world.locator("[data-world-hero]").evaluate((hero) => {
    const titleLines = Array.from(
      hero.querySelectorAll<HTMLElement>(".product-heading__title-line"),
    ).map((line) => {
      const box = line.getBoundingClientRect();
      return { left: box.left, right: box.right };
    });
    const heroBox = hero.getBoundingClientRect();
    const media = hero.querySelector<HTMLElement>("[data-world-can-media]");
    if (media === null) {
      throw new Error("Product media hook is missing.");
    }
    const mediaBox = media.getBoundingClientRect();
    return {
      hero: {
        height: heroBox.height,
        left: heroBox.left,
        right: heroBox.right,
      },
      media: { left: mediaBox.left, right: mediaBox.right },
      titleLines,
    };
  });
  expect(geometry.hero.height).toBeGreaterThanOrEqual(MINIMUM_HERO_HEIGHT_PX);
  for (const line of geometry.titleLines) {
    expect(line.left).toBeGreaterThanOrEqual(geometry.hero.left - 1);
    expect(line.right).toBeLessThanOrEqual(geometry.hero.right + 1);
  }
  expect(geometry.media.left).toBeGreaterThanOrEqual(geometry.hero.left - 1);
  expect(geometry.media.right).toBeLessThanOrEqual(geometry.hero.right + 1);
}

async function expectPhysicalLayers(world: Locator): Promise<void> {
  await expect(world.locator("[data-world-volume-layer]")).toHaveCount(
    MINIMUM_PHYSICAL_LAYERS,
  );
  await expect(world.locator("[data-world-particle]")).toHaveCount(5);
  await expect(world.locator("[data-world-can-aura]")).toHaveCount(1);
  await expect(world.locator("[data-world-reflection]")).toHaveCount(1);
}

async function expectActionHierarchy(world: Locator): Promise<void> {
  const primary = world.locator(".actions .control--primary");
  const secondary = world.locator(".actions .product-compare-link");
  const boxes = await Promise.all([
    primary.boundingBox(),
    secondary.boundingBox(),
  ]);
  const [primaryBox, secondaryBox] = boxes;
  expect(primaryBox).not.toBeNull();
  expect(secondaryBox).not.toBeNull();
  if (primaryBox === null || secondaryBox === null) {
    return;
  }
  expect(primaryBox.height).toBeGreaterThanOrEqual(MINIMUM_TARGET_PX);
  expect(secondaryBox.height).toBeGreaterThanOrEqual(MINIMUM_TARGET_PX);
  expect(primaryBox.width).toBeGreaterThan(secondaryBox.width);
}

test.describe("product-world responsive art direction", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("GIVEN the 390px artboards WHEN all worlds render THEN physical layers, type, media, and CTA hierarchy remain intact", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    for (const slug of PRODUCT_SLUGS) {
      const world = await openWorld(page, slug);
      await expectPhysicalLayers(world);
      await expectHeroGeometry(world);
      await expectActionHierarchy(world);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("GIVEN Mango-Coconut on mobile WHEN copy enters the collision seam THEN the paragraph stays on its warm readable plane", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    const world = await openWorld(page, "mango-coconut");
    const copyRight = await world
      .locator(".product-heading__description")
      .evaluate((copy) => copy.getBoundingClientRect().right);
    expect(copyRight).toBeLessThanOrEqual(
      MOBILE_VIEWPORT.width * MANGO_WARM_COPY_RATIO,
    );
  });

  test("GIVEN a 360px compact viewport WHEN every world renders THEN core content never creates horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize(COMPACT_VIEWPORT);
    for (const slug of PRODUCT_SLUGS) {
      const world = await openWorld(page, slug);
      await expect(world.locator("h1")).toBeVisible();
      await expect(world.locator(".actions .control--primary")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});
