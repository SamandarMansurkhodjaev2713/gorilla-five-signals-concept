import type { Locator, Page } from "@playwright/test";

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
const MAX_WHEEL_STEPS = 72;
const WHEEL_STEP_PX = 320;

/** Preserve exact authored values and priorities for all entrance-owned properties. */
export async function snapshotEntranceInline(root: Locator, selector: string) {
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

/** Reach the scene through genuine wheel input and two native paint frames per step. */
export async function wheelIntoEntrance(
  page: Page,
  root: Locator,
): Promise<void> {
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

/** Count only effects leased by this entrance, including descendant effects. */
export async function countOwnedEntranceEffects(
  root: Locator,
  prefix: string,
): Promise<number> {
  return root.evaluate(
    (element, value) =>
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.id.startsWith(value)).length,
    prefix,
  );
}
