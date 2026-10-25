import { expect, type Locator } from "@playwright/test";

/** Render an offscreen target using native scrolling and two paint frames. */
export async function prepareTargetPaint(target: Locator): Promise<void> {
  await target.evaluate(async (element) => {
    element.scrollIntoView({ behavior: "instant", block: "center" });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

/** Require real targets before a negative geometry or cleanup assertion. */
export async function expectPaintedTargets(
  targets: Locator,
  expectedCount: number,
): Promise<void> {
  expect(expectedCount).toBeGreaterThan(0);
  await expect(targets).toHaveCount(expectedCount);
  for (const target of await targets.all()) {
    await expect(target).toBeVisible();
    await expect
      .poll(() =>
        target.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return (
            Number.isFinite(bounds.width) &&
            Number.isFinite(bounds.height) &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        }),
      )
      .toBe(true);
  }
}
