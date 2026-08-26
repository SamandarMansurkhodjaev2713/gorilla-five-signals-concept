import { expect, test, type Locator, type Page } from "@playwright/test";

import { localizedPath, PRODUCT_SLUGS } from "./support/site";

const DESKTOP_VIEWPORT = { height: 900, width: 1440 } as const;
const MID_HERO_PROGRESS = 0.58;
const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";
const MOTION_READY_TIMEOUT_MS = 15_000;

async function openFullMotionWorld(page: Page, slug: string): Promise<Locator> {
  await page.goto(localizedPath("uz", `/products/${slug}`));
  const world = page.locator("[data-product-world]");
  await expect(world).toHaveAttribute("data-motion-ready", "full", {
    timeout: MOTION_READY_TIMEOUT_MS,
  });
  await expect(world).toHaveAttribute("data-world-entrance-ready", "animated", {
    timeout: MOTION_READY_TIMEOUT_MS,
  });
  return world;
}

async function motionSignature(world: Locator): Promise<string> {
  return world.evaluate((root) => {
    const selectors = [
      "[data-world-can-media]",
      "[data-world-art]",
      "[data-world-volume-layer]",
      "[data-world-particle]",
    ];
    return selectors
      .map((selector) => {
        const element = root.querySelector<HTMLElement>(selector);
        if (element === null) {
          throw new Error(`Missing physical-motion hook: ${selector}`);
        }
        return getComputedStyle(element).transform;
      })
      .join("|");
  });
}

async function scrubHero(page: Page, world: Locator): Promise<void> {
  const scrollTarget = await world
    .locator("[data-world-hero]")
    .evaluate(
      (hero, progress) => hero.getBoundingClientRect().height * progress,
      MID_HERO_PROGRESS,
    );
  await page.evaluate(
    (top) => window.scrollTo({ behavior: "instant", top }),
    scrollTarget,
  );
}

test.describe("product-world physical motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.addInitScript((preferenceKey) => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem(preferenceKey, "full");
    }, MOTION_PREFERENCE_KEY);
  });

  test("GIVEN five full-motion worlds WHEN their heroes scrub THEN every physical response is distinct", async ({
    page,
  }) => {
    const signatures = new Set<string>();

    for (const slug of PRODUCT_SLUGS) {
      const world = await openFullMotionWorld(page, slug);
      const initialSignature = await motionSignature(world);
      await scrubHero(page, world);
      await expect
        .poll(() => motionSignature(world))
        .not.toBe(initialSignature);
      signatures.add(await motionSignature(world));
    }

    expect(signatures.size).toBe(PRODUCT_SLUGS.length);
  });

  test("GIVEN reduced motion WHEN the hero scrolls THEN its complete composition remains static", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((preferenceKey) => {
      localStorage.setItem(preferenceKey, "system");
    }, MOTION_PREFERENCE_KEY);
    await page.goto(localizedPath("uz", "/products/lychee-pear"));
    const world = page.locator("[data-product-world]");
    await expect(world).toHaveAttribute("data-world-entrance-ready", "static", {
      timeout: MOTION_READY_TIMEOUT_MS,
    });
    const initialSignature = await motionSignature(world);
    await scrubHero(page, world);
    await expect.poll(() => motionSignature(world)).toBe(initialSignature);
  });
});
