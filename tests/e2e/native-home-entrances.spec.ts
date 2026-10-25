import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  openConsumerMotionControls,
  closeConsumerMotionControls,
} from "./support/consumer-motion-controls";
import { collectRuntimeErrors } from "./support/site";
import {
  installNativeEntranceObserver,
  readNativeEntranceObservation,
} from "./support/native-entrance-observer";

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
const SCENES = [
  {
    id: "range-manifesto",
    prefix: "gorilla-manifesto:",
    full: 11,
    lite: 11,
    targets:
      ".manifesto-handoff, [data-manifesto-line], .manifesto-intro, .manifesto-transmission > span, [data-motion-signal]",
  },
  {
    id: "material-film",
    prefix: "gorilla-material-film:",
    full: 10,
    lite: 10,
    targets:
      ".home-material-film__copy-inner, .home-material-film__stage, .home-material-film__calibration span, .home-material-film__crosshair > *",
  },
  {
    id: "culture-signal",
    prefix: "gorilla-terminal:",
    full: 21,
    lite: 6,
    targets:
      ".tashkent-terminal__copy > *, .tashkent-terminal__field, .tashkent-terminal__word, .tashkent-terminal__coordinate, .tashkent-terminal__route, .tashkent-terminal__route i, .tashkent-terminal__locator, .tashkent-terminal__locator > :not(.tashkent-terminal__grid):not(.tashkent-terminal__marker), .tashkent-terminal__grid, .tashkent-terminal__marker",
  },
] as const;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;
const MAX_WHEEL_STEPS = 72;
const WHEEL_STEP_PX = 320;

async function snapshot(root: Locator, selector: string) {
  return root.locator(selector).evaluateAll(
    (elements, properties) =>
      elements.map((element) => {
        if (!(element instanceof HTMLElement))
          throw new Error("An entrance target is not HTML.");
        return properties.map((property) => ({
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        }));
      }),
    PROPERTIES,
  );
}

async function wheelIntoScene(page: Page, root: Locator): Promise<void> {
  for (let step = 0; step < MAX_WHEEL_STEPS; step += 1) {
    if (
      await root.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < innerHeight / 2 && rect.bottom > innerHeight / 2;
      })
    )
      return;
    await page.mouse.wheel(0, WHEEL_STEP_PX);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
  throw new Error("Native wheel did not reach the entrance viewport.");
}

async function ownedCount(root: Locator, prefix: string): Promise<number> {
  return root.evaluate(
    (element, value) =>
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.id.startsWith(value)).length,
    prefix,
  );
}

for (const viewport of VIEWPORTS)
  for (const tier of ["full", "lite"] as const) {
    test(`GIVEN ${tier} entrances at ${viewport.width}px WHEN native wheel playback completes and the visitor pauses THEN every owned effect and inline declaration is released`, async ({
      page,
    }) => {
      const errors = await collectRuntimeErrors(page);
      await installNativeEntranceObserver(page);
      test.info().annotations.push({
        type: "native-clock-observer",
        description:
          "An Animation subclass delegates all native construction and records IDs, real started states and finish events. No clock/effect replacement, seek, pause or frame-performance claim.",
      });
      await page.setViewportSize(viewport);
      await page.addInitScript((preference) => {
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
        localStorage.setItem("gorilla:motion-preference:v1", preference);
      }, tier);
      await page.goto("/uz/");
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-runtime-state",
        "ready",
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        tier,
      );
      await expect(
        page.locator("[data-motion-home-culture-heading]"),
      ).toHaveCSS("text-wrap", "wrap");
      const baselines = await Promise.all(
        SCENES.map((scene) =>
          snapshot(
            page.locator(`[data-motion-scene="${scene.id}"]`),
            scene.targets,
          ),
        ),
      );
      for (const [index, scene] of SCENES.entries()) {
        const root = page.locator(`[data-motion-scene="${scene.id}"]`);
        await wheelIntoScene(page, root);
        // A finite 640ms entrance can complete while native wheel commands are
        // being acknowledged; observe its real start rather than miss that window.
        await expect
          .poll(
            async () =>
              (await readNativeEntranceObservation(page, scene.prefix)).started,
          )
          .toBe(scene[tier]);
        await expect.poll(() => ownedCount(root, scene.prefix)).toBe(0);
        await expect
          .poll(
            async () =>
              (await readNativeEntranceObservation(page, scene.prefix))
                .finished,
          )
          .toBeGreaterThan(0);
        await expect
          .poll(() => snapshot(root, scene.targets))
          .toEqual(baselines[index]);
      }
      const pause = await openConsumerMotionControls(page);
      await pause.click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await closeConsumerMotionControls(page);
      for (const [index, scene] of SCENES.entries()) {
        const root = page.locator(`[data-motion-scene="${scene.id}"]`);
        await expect(root).toHaveAttribute("data-motion-ready", "reduced");
        expect(await ownedCount(root, scene.prefix)).toBe(0);
        expect(await snapshot(root, scene.targets)).toEqual(baselines[index]);
      }
      expect(errors).toEqual([]);
    });
  }
