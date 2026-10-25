import { expect, test, type Locator } from "@playwright/test";

import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";

const PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;
const TARGETS = [
  "[data-motion-hero-frequency]",
  "[data-hero-ghost]",
  "[data-motion-hero-orbit]",
  "[data-hero-primary-can]",
  "[data-motion-hero-band]",
  "[data-motion-hero-support]",
  "[data-motion-hero-title]",
].join(", ");
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

async function snapshot(targets: Locator) {
  return targets.evaluateAll(
    (elements, properties) =>
      elements.map((element) => {
        if (!(element instanceof HTMLElement))
          throw new Error("Hero motion target is not HTML.");
        return properties.map((property) => ({
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        }));
      }),
    PROPERTIES,
  );
}

for (const viewport of VIEWPORTS) {
  for (const preference of ["full", "lite"] as const) {
    test(`GIVEN ${preference} at ${viewport.width}px WHEN entry is interrupted and capability cycles THEN original hero declarations survive pause and resize`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((value) => {
        localStorage.setItem("gorilla:motion-preference:v1", value);
      }, preference);
      await page.goto("/uz/");
      await expect(page.locator("[data-responsible-entry]")).toBeVisible();
      const hero = page.locator('[data-motion-scene="hero"]');
      await expect(hero.locator("[data-hero-primary-can]")).toHaveCount(1);
      await expect(hero.locator("[data-motion-hero-orbit]")).toHaveCount(1);
      await expect(hero.locator("[data-hero-ghost]")).toHaveCount(4);
      await expect(hero.locator("[data-motion-hero-title]")).toHaveCount(2);
      const targets = hero.locator(TARGETS);
      expect(await targets.count()).toBeGreaterThan(10);
      const original = await snapshot(targets);
      await page.locator("[data-responsible-continue]").click();
      await expect(hero).toHaveAttribute("data-motion-ready", preference);
      for (let cycle = 0; cycle < 2; cycle += 1) {
        const pause = await openConsumerMotionControls(page);
        await pause.click();
        await expect(page.locator("html")).toHaveAttribute(
          "data-motion-runtime-state",
          "ready",
        );
        await expect(page.locator("html")).toHaveAttribute(
          "data-motion-tier",
          "reduced",
        );
        expect(await snapshot(targets)).toEqual(original);
        if (cycle === 0) {
          await page
            .locator(
              `.menu-motion-console [data-motion-preference="${preference}"]`,
            )
            .click();
          await expect(hero).toHaveAttribute("data-motion-ready", preference);
          await closeConsumerMotionControls(page);
        }
      }
      await closeConsumerMotionControls(page);
      const alternate = viewport.width === 390 ? VIEWPORTS[1] : VIEWPORTS[0];
      await page.setViewportSize(alternate);
      expect(await snapshot(targets)).toEqual(original);
      await page.setViewportSize(viewport);
      expect(await snapshot(targets)).toEqual(original);
      await expect(hero.locator("[data-hero-primary-can]")).toBeVisible();
    });
  }
}

test("GIVEN interrupted Hero setup WHEN pointer initialization fails THEN styles and ownership roll back while the menu remains usable", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[1]);
  await page.addInitScript(() => {
    localStorage.setItem("gorilla:motion-preference:v1", "full");
    const nativeAdd: unknown = Reflect.get(
      EventTarget.prototype,
      "addEventListener",
    );
    if (typeof nativeAdd !== "function")
      throw new Error("Native event registration is unavailable.");
    EventTarget.prototype.addEventListener = function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ): void {
      if (
        type === "pointermove" &&
        this instanceof HTMLElement &&
        this.matches('[data-motion-scene="hero"]')
      ) {
        Reflect.set(EventTarget.prototype, "addEventListener", nativeAdd);
        document.documentElement.dataset.testHeroSetupFailure = "injected";
        throw new Error("Injected Hero pointer setup failure.");
      }
      Reflect.apply(nativeAdd, this, [type, listener, options]);
    };
  });
  await page.goto("/uz/");
  await expect(page.locator("[data-responsible-entry]")).toBeVisible();
  const hero = page.locator('[data-motion-scene="hero"]');
  await hero.locator("[data-hero-primary-can]").evaluate((element) => {
    if (!(element instanceof HTMLElement))
      throw new Error("Hero can is not HTML.");
    element.style.setProperty("opacity", "0.8", "important");
  });
  const targets = hero.locator(TARGETS);
  const original = await snapshot(targets);
  await page.locator("[data-responsible-continue]").click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-test-hero-setup-failure",
    "injected",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect(hero).not.toHaveAttribute("data-motion-ready", /.+/u);
  expect(await snapshot(targets)).toEqual(original);
  const pause = await openConsumerMotionControls(page);
  await pause.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "reduced",
  );
  expect(await snapshot(targets)).toEqual(original);
  await closeConsumerMotionControls(page);
});
