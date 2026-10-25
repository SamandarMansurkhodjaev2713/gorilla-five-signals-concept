import { expect, test } from "@playwright/test";

import {
  HERO_PRESENTATION_TARGETS,
  snapshotHeroPresentation,
} from "./support/hero-presentation";

const POST_CANCELLATION_PAINT_FRAMES = 4;

interface HeroEarlyCancelProbe {
  outcome: "armed" | "injected" | "missing-control";
  readyBeforeInjection: string | null;
  runtimeBeforeInjection: string | null;
  mutations: number;
  lateFullMarker: boolean;
}

declare global {
  interface Window {
    __heroEarlyCancelProbe?: HeroEarlyCancelProbe;
    __stopHeroEarlyCancelProbe?: () => void;
  }
}

test.afterEach(async ({ page }) => {
  if (!page.isClosed())
    await page.evaluate(() => window.__stopHeroEarlyCancelProbe?.());
});

test("GIVEN first-target Full preparation WHEN a synthetic Reduced capability fault interrupts setup THEN untouched and prepared Hero declarations retain their SSR ownership", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "synthetic-capability-fault",
    description:
      "MutationObserver invokes the real Reduced preference button with DOM.click; this is not native-user-input evidence.",
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.removeItem("gorilla-responsible-entry-confirmed");
    localStorage.setItem("gorilla:motion-preference:v1", "full");
  });
  await page.goto("/uz/");
  await expect(page.locator("[data-responsible-entry]")).toBeVisible();
  const hero = page.locator('[data-motion-scene="hero"]');
  const targets = hero.locator(HERO_PRESENTATION_TARGETS);
  expect(await targets.count()).toBeGreaterThan(10);
  const original = await snapshotHeroPresentation(targets);
  await hero.evaluate((root) => {
    const frequency = root.querySelector("[data-motion-hero-frequency]");
    if (!(frequency instanceof HTMLElement))
      throw new Error("The first real Hero frequency target is missing.");
    const probe: HeroEarlyCancelProbe = {
      outcome: "armed",
      readyBeforeInjection: null,
      runtimeBeforeInjection: null,
      mutations: 0,
      lateFullMarker: false,
    };
    window.__heroEarlyCancelProbe = probe;

    const markerObserver = new MutationObserver((records) => {
      if (
        root.getAttribute("data-motion-ready") === "full" ||
        records.some((record) => record.oldValue === "full")
      )
        probe.lateFullMarker = true;
    });
    function stop(): void {
      preparationObserver.disconnect();
      markerObserver.disconnect();
      window.removeEventListener("pagehide", stop);
      delete window.__stopHeroEarlyCancelProbe;
    }
    const preparationObserver = new MutationObserver((records) => {
      preparationObserver.disconnect();
      probe.mutations = records.length;
      probe.readyBeforeInjection = root.getAttribute("data-motion-ready");
      probe.runtimeBeforeInjection =
        document.documentElement.dataset.motionRuntimeState ?? null;
      const reduced = document.querySelector(
        '.menu-motion-console button[data-motion-preference="reduced"]',
      );
      if (!(reduced instanceof HTMLButtonElement)) {
        probe.outcome = "missing-control";
        stop();
        return;
      }
      probe.outcome = "injected";
      // Intentional synthetic fault: interrupt the current setup generation at its first transaction.
      reduced.click();
    });
    preparationObserver.observe(frequency, {
      attributes: true,
      attributeFilter: ["style"],
    });
    markerObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-motion-ready"],
      attributeOldValue: true,
    });
    window.addEventListener("pagehide", stop, { once: true });
    window.__stopHeroEarlyCancelProbe = stop;
  });
  await page.locator("[data-responsible-continue]").click();
  await expect
    .poll(() => page.evaluate(() => window.__heroEarlyCancelProbe?.outcome))
    .toBe("injected");
  const probe = await page.evaluate(() => window.__heroEarlyCancelProbe);
  if (probe === undefined)
    throw new Error("Early-cancellation probe was not installed.");
  expect(probe.mutations).toBeGreaterThan(0);
  expect(probe.readyBeforeInjection).toBeNull();
  expect(probe.runtimeBeforeInjection).toBe("loading");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "reduced",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-preference",
    "reduced",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect(hero).toHaveAttribute("data-motion-ready", "reduced");
  await page.evaluate(async (frameCount) => {
    for (let frame = 0; frame < frameCount; frame += 1)
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
  }, POST_CANCELLATION_PAINT_FRAMES);
  expect(await snapshotHeroPresentation(targets)).toEqual(original);
  expect(
    await page.evaluate(() => window.__heroEarlyCancelProbe?.lateFullMarker),
  ).toBe(false);
  await expect(hero).toHaveAttribute("data-motion-ready", "reduced");
});
