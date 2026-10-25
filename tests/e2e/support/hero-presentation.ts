import type { Locator } from "@playwright/test";

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
export const HERO_PRESENTATION_TARGETS = [
  "[data-motion-hero-frequency]",
  "[data-hero-ghost]",
  "[data-motion-hero-orbit]",
  "[data-hero-primary-can]",
  "[data-motion-hero-band]",
  "[data-motion-hero-support]",
  "[data-motion-hero-title]",
].join(", ");

/** Capture exact declaration values and priorities, not merely a similar resting pose. */
export async function snapshotHeroPresentation(targets: Locator) {
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
