import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  localizedPath,
  PRODUCT_SLUGS,
} from "./support/site";

const DESKTOP_VIEWPORT = { height: 900, width: 1440 } as const;
const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;
const MOTION_READY_TIMEOUT_MS = 15_000;
const MINIMUM_TARGET_PX = 44;
const NATIVE_CAN_WIDTH_PX = 640;

const MOTION_PATHS = new Map<string, string>([
  ["extra", "axial-overdrive"],
  ["lychee-pear", "prismatic-orbit"],
  ["mango-coconut", "temperature-collision"],
  ["original", "rupture-strike"],
  ["zero", "frequency-lock"],
]);

async function openWorld(page: Page, slug: string): Promise<Locator> {
  await page.goto(localizedPath("uz", `/products/${slug}`));
  const world = page.locator("[data-product-world]");
  await expect(world).toHaveAttribute("data-product-world", slug);
  return world;
}

async function expectCanWithinNativeResolution(world: Locator): Promise<void> {
  const dimensions = await world.locator(".can-stage img").evaluate((node) => {
    if (!(node instanceof HTMLImageElement)) {
      throw new Error("Product media is not an image.");
    }
    return {
      naturalWidth: node.naturalWidth,
      renderedWidth: node.getBoundingClientRect().width,
    };
  });
  expect(dimensions.naturalWidth).toBeGreaterThan(0);
  expect(dimensions.naturalWidth).toBeLessThanOrEqual(NATIVE_CAN_WIDTH_PX);
  expect(dimensions.renderedWidth).toBeLessThanOrEqual(
    dimensions.naturalWidth + 1,
  );
}

test.describe("five product-detail worlds", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    });
  });

  test("GIVEN five products WHEN desktop worlds render THEN their macro-composition signatures are unique", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    const signatures = new Set<string>();

    for (const slug of PRODUCT_SLUGS) {
      const world = await openWorld(page, slug);
      await expect(world).toHaveAttribute(
        "data-motion-path",
        MOTION_PATHS.get(slug) ?? "missing",
        { timeout: MOTION_READY_TIMEOUT_MS },
      );
      const signature = await world.evaluate((root) => {
        const heading = root.querySelector<HTMLElement>(".product-heading");
        const can = root.querySelector<HTMLElement>(".can-stage");
        const handoff = root.querySelector<HTMLElement>(".adjacent-products");
        const hero = root.querySelector<HTMLElement>(".product-hero");
        if (
          heading === null ||
          can === null ||
          handoff === null ||
          hero === null
        ) {
          throw new Error("Product macro-composition hooks are incomplete.");
        }
        return JSON.stringify({
          can: getComputedStyle(can).gridArea,
          handoff: getComputedStyle(handoff).gridTemplateColumns,
          heading: getComputedStyle(heading).gridArea,
          surface: getComputedStyle(hero).backgroundImage,
        });
      });
      signatures.add(signature);
      await expectCanWithinNativeResolution(world);
      await expectNoHorizontalOverflow(page);
    }

    expect(signatures.size).toBe(PRODUCT_SLUGS.length);
  });

  test("GIVEN five worlds WHEN compact layouts render THEN title, product, actions, and legal content stay readable", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    for (const slug of PRODUCT_SLUGS) {
      const world = await openWorld(page, slug);
      await expect(world.locator("h1")).toBeVisible();
      await expect(world.locator(".can-stage img")).toBeVisible();
      await expect(world.locator(".warning-panel")).toBeVisible();
      await expect(world.locator(".actions .control")).toBeVisible();
      const controlHeight = await world
        .locator(".actions .control")
        .evaluate((node) => node.getBoundingClientRect().height);
      expect(controlHeight).toBeGreaterThanOrEqual(MINIMUM_TARGET_PX);
      await expectCanWithinNativeResolution(world);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("GIVEN reduced motion WHEN every world mounts THEN its static composition is complete and deterministic", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(MOBILE_VIEWPORT);

    for (const slug of PRODUCT_SLUGS) {
      const world = await openWorld(page, slug);
      await expect(world).toHaveAttribute("data-motion-ready", "reduced", {
        timeout: MOTION_READY_TIMEOUT_MS,
      });
      const visibility = await world.evaluate((root) => {
        const selectors = [
          "[data-world-copy]",
          "[data-world-can]",
          "[data-world-information]",
          "[data-world-handoff]",
        ];
        return selectors.map((selector) => {
          const element = root.querySelector<HTMLElement>(selector);
          if (element === null) {
            throw new Error(`Missing reduced-motion hook: ${selector}`);
          }
          const style = getComputedStyle(element);
          return { opacity: style.opacity, visibility: style.visibility };
        });
      });
      expect(visibility).toEqual(
        Array.from({ length: 4 }, () => ({
          opacity: "1",
          visibility: "visible",
        })),
      );
    }
  });
});
