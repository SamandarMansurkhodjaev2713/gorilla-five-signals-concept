import { expect, type Page } from "@playwright/test";

/** Read a validated coordinate without assuming the browser router updates it. */
export async function readHistoryPosition(
  page: Page,
  field: string,
): Promise<number | null> {
  return page.evaluate((key) => {
    const state: unknown = history.state;
    if (typeof state !== "object" || state === null || Array.isArray(state))
      return null;
    const value: unknown = Reflect.get(state, key);
    return typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : null;
  }, field);
}

/** Reach a real wheel-driven coordinate and allow two native paint frames. */
export async function scrollAndPaint(page: Page, top: number): Promise<void> {
  const { current, target } = await page.evaluate(
    (position) => ({
      current: scrollY,
      target: Math.min(
        Math.max(0, Math.round(position)),
        document.documentElement.scrollHeight - innerHeight,
      ),
    }),
    top,
  );
  await page.mouse.wheel(0, target - current);
  await expect
    .poll(() =>
      page.evaluate((position) => Math.abs(scrollY - position), target),
    )
    .toBeLessThanOrEqual(1);
  await paintNativeFrames(page);
}

/** Sample native timelines after style association and two browser paint opportunities. */
async function paintNativeFrames(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

/** Read the actual native Hero exit animation and its painted product bounds. */
export async function readExit(page: Page) {
  await paintNativeFrames(page);
  return page.locator("[data-hero-primary-can]").evaluate((element) => {
    const animations = element
      .getAnimations()
      .filter(
        (animation): animation is CSSAnimation =>
          animation instanceof CSSAnimation &&
          animation.animationName === "hero-can-handoff",
      );
    const rectangle = element.getBoundingClientRect();
    return {
      supported: CSS.supports("animation-timeline: view(block)"),
      count: animations.length,
      progress: animations[0]?.effect?.getComputedTiming().progress ?? null,
      fill: getComputedStyle(element).animationFillMode,
      width: rectangle.width,
      height: rectangle.height,
    };
  });
}

/** Require an active range rather than an absent animation or endpoint fill. */
export function expectActive(progress: number | null): void {
  expect(progress).not.toBeNull();
  if (progress === null) throw new Error("The real Hero exit must be active.");
  expect(progress).toBeGreaterThan(0);
  expect(progress).toBeLessThan(1);
}
