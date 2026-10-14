import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const BOUNDS_TOLERANCE_PX = 1;
const MINIMUM_TOUCH_TARGET_PX = 44;

/** Native modal ownership and bounded panel scrolling remain operable after header wrapping. */
export async function verifyCompactMenu(page: Page): Promise<void> {
  const summary = page.locator(".mobile-navigation > summary");
  await summary.click();
  const panel = page.locator(".mobile-navigation__panel");
  await expect(panel).toBeVisible();
  const bounds = await panel.evaluate((element) => ({
    top: element.getBoundingClientRect().top,
    height: element.clientHeight,
    viewportHeight: window.innerHeight,
    overflow: getComputedStyle(element).overflowY,
  }));
  expect(bounds.top).toBeGreaterThanOrEqual(-BOUNDS_TOLERANCE_PX);
  expect(bounds.height).toBeLessThanOrEqual(
    bounds.viewportHeight + BOUNDS_TOLERANCE_PX,
  );
  expect(bounds.overflow).toBe("auto");
  const close = page.locator("[data-motion-menu-close]");
  await close.focus();
  await expect(close).toBeFocused();
  expect((await close.boundingBox())?.height).toBeGreaterThanOrEqual(
    MINIMUM_TOUCH_TARGET_PX,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".mobile-navigation")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(summary).toBeFocused();
}

/** Real focused-heading scroll proves the conservative row clearance covers the actual sticky header. */
export async function verifyCompactHeadingClearance(page: Page): Promise<void> {
  const heading = page.locator(".hero h1");
  await heading.evaluate((element) => {
    if (!(element instanceof HTMLElement))
      throw new Error("Expected a focusable heading.");
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await expect(heading).toBeFocused();
  const clearance = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const title = document.querySelector(".hero h1");
    if (header === null || title === null)
      throw new Error("Missing compact focus subjects.");
    return {
      top: title.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
      sticky: getComputedStyle(header).position === "sticky",
    };
  });
  expect(clearance.top).toBeGreaterThanOrEqual(
    clearance.sticky ? clearance.headerBottom - BOUNDS_TOLERANCE_PX : 0,
  );
}
