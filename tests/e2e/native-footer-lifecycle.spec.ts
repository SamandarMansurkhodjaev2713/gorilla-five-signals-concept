import { expect, test } from "@playwright/test";

import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";
import {
  countOwnedEntranceEffects,
  snapshotEntranceInline,
  wheelIntoEntrance,
} from "./support/native-entrance-lifecycle";
import {
  installNativeEntranceObserver,
  readNativeEntranceObservation,
} from "./support/native-entrance-observer";
import { collectRuntimeErrors } from "./support/site";

const FOOTER_PREFIX = "gorilla-footer:";
const FOOTER_TARGETS = "[data-motion-signal]";
const FOOTER_SIGNAL_COUNT = 6;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS)
  for (const tier of ["full", "lite"] as const) {
    test(`GIVEN ${tier} footer at ${viewport.width}px WHEN native wheel playback completes and the visitor pauses THEN all six nested signals release their effects and inline declarations`, async ({
      page,
    }) => {
      const errors = await collectRuntimeErrors(page);
      await installNativeEntranceObserver(page);
      test.info().annotations.push({
        type: "native-clock-observer",
        description:
          "An Animation subclass delegates all native construction and records IDs, real started states and finish events. Genuine wheel input traverses the homepage; no clock/effect replacement, seek, pause or frame-performance claim.",
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
      const root = page.locator('.site-footer[data-motion-scene="footer"]');
      await expect(root.locator(FOOTER_TARGETS)).toHaveCount(
        FOOTER_SIGNAL_COUNT,
      );
      const baseline = await snapshotEntranceInline(root, FOOTER_TARGETS);

      await wheelIntoEntrance(page, root);
      await expect
        .poll(
          async () =>
            (await readNativeEntranceObservation(page, FOOTER_PREFIX)).started,
        )
        .toBe(FOOTER_SIGNAL_COUNT);
      await expect
        .poll(() => countOwnedEntranceEffects(root, FOOTER_PREFIX))
        .toBe(0);
      await expect
        .poll(
          async () =>
            (await readNativeEntranceObservation(page, FOOTER_PREFIX)).finished,
        )
        .toBeGreaterThan(0);
      await expect
        .poll(() => snapshotEntranceInline(root, FOOTER_TARGETS))
        .toEqual(baseline);

      const pause = await openConsumerMotionControls(page);
      await pause.click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await closeConsumerMotionControls(page);
      await expect(root).toHaveAttribute("data-motion-ready", "reduced");
      expect(await countOwnedEntranceEffects(root, FOOTER_PREFIX)).toBe(0);
      expect(await snapshotEntranceInline(root, FOOTER_TARGETS)).toEqual(
        baseline,
      );
      expect(errors).toEqual([]);
    });
  }
