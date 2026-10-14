import { expect, test } from "@playwright/test";

import {
  SEMANTIC_COPY_PROBE_SCHEMA,
  observeSemanticCopy,
} from "./support/semantic-copy-probe";
import { PRODUCT_SLUGS, localizedPath } from "./support/site";

const COPY_SELECTOR = "[data-world-copy]";
const WORLD_SELECTOR = "[data-product-world]";
const PROBE_ATTRIBUTE = "data-semantic-copy-probe";
const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";
const MOTION_READY_TIMEOUT_MS = 15_000;
const MAX_PROBE_STATES = 256;
const MOTION_PREFERENCES = ["full", "lite"] as const;

for (const preference of MOTION_PREFERENCES) {
  for (const slug of PRODUCT_SLUGS) {
    test(`GIVEN ${slug} in ${preference} WHEN its scene mounts and enters THEN its real heading and actions never become hidden`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1_440, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.addInitScript(
        ({ key, value }) => localStorage.setItem(key, value),
        {
          key: MOTION_PREFERENCE_KEY,
          value: preference,
        },
      );
      await page.addInitScript(observeSemanticCopy, {
        copySelector: COPY_SELECTOR,
        maximumStates: MAX_PROBE_STATES,
        probeAttribute: PROBE_ATTRIBUTE,
        worldSelector: WORLD_SELECTOR,
      });
      await page.goto(localizedPath("uz", `/products/${slug}`));
      await page.locator("[data-responsible-continue]").click();
      const world = page.locator(WORLD_SELECTOR);
      await expect(world).toHaveAttribute("data-motion-ready", preference, {
        timeout: MOTION_READY_TIMEOUT_MS,
      });
      await expect(world).toHaveAttribute(
        "data-world-entrance-ready",
        "animated",
        { timeout: MOTION_READY_TIMEOUT_MS },
      );
      const source = await page.locator("html").getAttribute(PROBE_ATTRIBUTE);
      expect(source).not.toBeNull();
      const states = SEMANTIC_COPY_PROBE_SCHEMA.parse(
        JSON.parse(source ?? "null"),
      );
      expect(states.map((state) => state.phase)).toContain("mounted");
      expect(states.map((state) => state.phase)).toContain("animated");
      for (const state of states) {
        if (state.source === "previous-inline") {
          expect(["hidden", "collapse"]).not.toContain(state.oldVisibility);
          if (state.oldOpacity !== "") expect(state.oldOpacity).toBe("1");
          continue;
        }
        expect(state.headingVisibility).toBe("visible");
        expect(state.copyVisibility).toBe("visible");
        expect(state.copyOpacity).toBe("1");
        expect(
          state.actionVisibility.every((value) => value === "visible"),
        ).toBe(true);
      }
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }
}

test("GIVEN a hidden-to-visible inline mutation within one batch WHEN the semantic probe records history THEN the original autoAlpha-zero defect is detected", async ({
  page,
}) => {
  await page.addInitScript(observeSemanticCopy, {
    copySelector: COPY_SELECTOR,
    maximumStates: MAX_PROBE_STATES,
    probeAttribute: PROBE_ATTRIBUTE,
    worldSelector: WORLD_SELECTOR,
  });
  await page.goto("about:blank");
  await page.setContent(
    '<article data-product-world><div data-world-copy><h1>Probe heading</h1><a href="#probe">Probe action</a></div></article>',
  );
  await expect(page.locator("html")).toHaveAttribute(
    PROBE_ATTRIBUTE,
    /"mounted"/,
  );
  await page.evaluate(() => {
    const copy = document.querySelector("[data-world-copy]");
    const world = document.querySelector("[data-product-world]");
    if (!(copy instanceof HTMLElement) || !(world instanceof HTMLElement))
      throw new Error("Missing controlled probe fixture.");
    copy.style.opacity = "0";
    copy.style.visibility = "hidden";
    copy.style.opacity = "1";
    copy.style.visibility = "inherit";
    world.dataset.worldEntranceReady = "animated";
  });
  await expect(page.locator("html")).toHaveAttribute(
    PROBE_ATTRIBUTE,
    /"previous-inline"/,
  );
  const source = await page.locator("html").getAttribute(PROBE_ATTRIBUTE);
  const states = SEMANTIC_COPY_PROBE_SCHEMA.parse(JSON.parse(source ?? "null"));
  expect(
    states.some(
      (state) =>
        state.source === "previous-inline" &&
        (state.oldOpacity === "0" || state.oldVisibility === "hidden"),
    ),
  ).toBe(true);
  expect(
    states.some(
      (state) =>
        state.source === "computed" &&
        state.phase === "animated" &&
        state.headingVisibility === "visible",
    ),
  ).toBe(true);
});
