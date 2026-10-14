import { expect, test } from "@playwright/test";
import { z } from "zod";

import { PRODUCT_SLUGS, localizedPath } from "./support/site";

const COPY_SELECTOR = "[data-world-copy]";
const WORLD_SELECTOR = "[data-product-world]";
const PROBE_ATTRIBUTE = "data-semantic-copy-probe";
const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";
const MOTION_READY_TIMEOUT_MS = 15_000;
const MAX_PROBE_STATES = 256;
const MOTION_PREFERENCES = ["full", "lite"] as const;
const VISIBILITY_STATE_SCHEMA = z.object({
  actionVisibility: z.array(z.string()).min(1),
  copyOpacity: z.string(),
  copyVisibility: z.string(),
  headingVisibility: z.string(),
  phase: z.string(),
});
const PROBE_SCHEMA = z.array(VISIBILITY_STATE_SCHEMA).min(2);

function observeSemanticCopy(options: {
  readonly copySelector: string;
  readonly maximumStates: number;
  readonly probeAttribute: string;
  readonly worldSelector: string;
}): void {
  const states: unknown[] = [];
  let previousState = "";
  const record = (): void => {
    const copy = document.querySelector(options.copySelector);
    const heading = copy?.querySelector("h1");
    const world = document.querySelector<HTMLElement>(options.worldSelector);
    if (copy === null || heading === undefined || heading === null) return;
    const state = {
      actionVisibility: [...copy.querySelectorAll("a[href], button")].map(
        (action) => getComputedStyle(action).visibility,
      ),
      copyOpacity: getComputedStyle(copy).opacity,
      copyVisibility: getComputedStyle(copy).visibility,
      headingVisibility: getComputedStyle(heading).visibility,
      phase: world?.dataset.worldEntranceReady ?? "mounted",
    };
    const signature = JSON.stringify(state);
    if (signature === previousState || states.length >= options.maximumStates)
      return;
    states.push(state);
    previousState = signature;
    document.documentElement.setAttribute(
      options.probeAttribute,
      JSON.stringify(states),
    );
  };
  const observer = new MutationObserver(record);
  observer.observe(document, {
    attributeFilter: ["style", "class", "data-world-entrance-ready"],
    attributes: true,
    childList: true,
    subtree: true,
  });
  window.addEventListener("pagehide", () => observer.disconnect(), {
    once: true,
  });
}

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
      const states = PROBE_SCHEMA.parse(JSON.parse(source ?? "null"));
      expect(states.map((state) => state.phase)).toContain("mounted");
      expect(states.map((state) => state.phase)).toContain("animated");
      for (const state of states) {
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
