import { Buffer } from "node:buffer";

import { expect, test } from "@playwright/test";

import { HERO_PRESENTATION_TARGETS } from "./support/hero-presentation";

const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;
const MINIMUM_PREPARATION_OBSERVATIONS = 17;
const MAXIMUM_OBSERVATION_FRAMES = 600;
const REST_GEOMETRY_TOLERANCE_PX = 1;

interface TargetPresentation {
  primaryCan: boolean;
  inline: { property: string; value: string; priority: string }[];
  computed: { property: string; value: string }[];
  bounds: { x: number; y: number; width: number; height: number };
}

interface HeroPreparationProbe {
  outcome: "observing" | "full" | "limit" | "pagehide";
  observations: number;
  baseline: TargetPresentation[] | null;
  authoredStart: TargetPresentation[] | null;
  divergences: string[];
}

declare global {
  interface Window {
    __heroPreparationProbe?: HeroPreparationProbe;
    __stopHeroPreparationProbe?: () => void;
  }
}

test.afterEach(async ({ page }, testInfo) => {
  let evidence: unknown;
  try {
    evidence = page.isClosed()
      ? { unavailable: "The page was closed before probe attachment." }
      : await page.evaluate(() => {
          window.__stopHeroPreparationProbe?.();
          return (
            window.__heroPreparationProbe ?? {
              unavailable: "Probe was not installed.",
            }
          );
        });
  } catch (error: unknown) {
    evidence = {
      unavailable: error instanceof Error ? error.message : String(error),
    };
  }
  await testInfo.attach("hero-staged-preparation-probe.json", {
    body: Buffer.from(JSON.stringify(evidence, undefined, 2)),
    contentType: "application/json",
  });
});

test("GIVEN staged Full Hero preparation WHEN each owned frame paints THEN the visible rest pose survives until the authored entrance starts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(
    ({ selector, properties, maximumFrames }) => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem("gorilla:motion-preference:v1", "full");
      const probe: HeroPreparationProbe = {
        outcome: "observing",
        observations: 0,
        baseline: null,
        authoredStart: null,
        divergences: [],
      };
      window.__heroPreparationProbe = probe;
      let pendingFrame: number | null = null;
      let frames = 0;

      function readPresentation(hero: HTMLElement): TargetPresentation[] {
        return Array.from(hero.querySelectorAll(selector), (element) => {
          if (!(element instanceof HTMLElement))
            throw new Error("Hero preparation target is not HTML.");
          const computed = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return {
            primaryCan: element.matches("[data-hero-primary-can]"),
            inline: properties.map((property) => ({
              property,
              value: element.style.getPropertyValue(property),
              priority: element.style.getPropertyPriority(property),
            })),
            computed: properties.map((property) => ({
              property,
              value: computed.getPropertyValue(property),
            })),
            bounds: {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
            },
          };
        });
      }

      function comparePreparation(current: TargetPresentation[]): void {
        const baseline = probe.baseline;
        if (baseline === null) {
          probe.baseline = current;
          return;
        }
        if (current.length !== baseline.length)
          probe.divergences.push(
            `Target count changed at observation ${probe.observations}.`,
          );
        current.forEach((target, index) => {
          const original = baseline[index];
          if (original === undefined) return;
          for (const family of ["inline", "computed"] as const) {
            if (
              JSON.stringify(target[family]) !==
              JSON.stringify(original[family])
            )
              probe.divergences.push(
                `Observation ${probe.observations}, target ${index}, ${family}: ${JSON.stringify(target[family])}; baseline: ${JSON.stringify(original[family])}`,
              );
          }
        });
      }

      function dispose(): void {
        if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
        pendingFrame = null;
        window.removeEventListener("pagehide", onPageHide);
        delete window.__stopHeroPreparationProbe;
      }
      function onPageHide(): void {
        probe.outcome = "pagehide";
        dispose();
      }
      function observe(): void {
        pendingFrame = null;
        frames += 1;
        const hero = document.querySelector<HTMLElement>(
          '[data-motion-scene="hero"]',
        );
        const image = hero?.querySelector<HTMLImageElement>(
          "[data-hero-primary-can] img",
        );
        if (hero?.dataset.motionReady === "full") {
          probe.authoredStart = readPresentation(hero);
          probe.outcome = "full";
          dispose();
          return;
        }
        if (
          hero &&
          image?.complete &&
          image.naturalWidth > 0 &&
          document.fonts.status === "loaded" &&
          document.documentElement.dataset.motionTier === "full"
        ) {
          probe.observations += 1;
          comparePreparation(readPresentation(hero));
        }
        if (frames >= maximumFrames) {
          probe.outcome = "limit";
          dispose();
          return;
        }
        pendingFrame = requestAnimationFrame(observe);
      }
      window.addEventListener("pagehide", onPageHide, { once: true });
      window.__stopHeroPreparationProbe = dispose;
      pendingFrame = requestAnimationFrame(observe);
    },
    {
      selector: HERO_PRESENTATION_TARGETS,
      properties: PRESENTATION_PROPERTIES,
      maximumFrames: MAXIMUM_OBSERVATION_FRAMES,
    },
  );
  await page.goto("/uz/");
  await expect
    .poll(() => page.evaluate(() => window.__heroPreparationProbe?.outcome))
    .toBe("full");
  const probe = await page.evaluate(() => window.__heroPreparationProbe);
  if (probe === undefined)
    throw new Error("Hero preparation probe was not installed.");
  expect(probe.observations).toBeGreaterThanOrEqual(
    MINIMUM_PREPARATION_OBSERVATIONS,
  );
  expect(probe.divergences).toEqual([]);
  const rest = probe.baseline?.find((target) => target.primaryCan);
  const start = probe.authoredStart?.find((target) => target.primaryCan);
  if (rest === undefined || start === undefined)
    throw new Error(
      "Real primary-can rest and authored start poses must both exist.",
    );
  expect(rest.bounds.width).toBeGreaterThan(0);
  expect(rest.bounds.height).toBeGreaterThan(0);
  expect(start.inline).not.toEqual(rest.inline);
  expect(Math.abs(start.bounds.height - rest.bounds.height)).toBeGreaterThan(
    REST_GEOMETRY_TOLERANCE_PX,
  );
  const hero = page.locator('[data-motion-scene="hero"]');
  await expect(hero).toHaveAttribute("data-motion-ready", "full");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect
    .poll(() =>
      hero.locator("[data-hero-primary-can]").evaluate((element, original) => {
        const bounds = element.getBoundingClientRect();
        return Math.max(
          Math.abs(bounds.x - original.x),
          Math.abs(bounds.y - original.y),
          Math.abs(bounds.width - original.width),
          Math.abs(bounds.height - original.height),
        );
      }, rest.bounds),
    )
    .toBeLessThanOrEqual(REST_GEOMETRY_TOLERANCE_PX);
});
