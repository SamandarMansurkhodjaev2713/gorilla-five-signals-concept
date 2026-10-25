import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const MINIMUM_CONTROL_SIZE_PX = 44;

/** Open the actual consumer menu; runtime controls must not occupy the header. */
export async function openConsumerMotionControls(page: Page): Promise<Locator> {
  const header = page.locator(".site-header");
  await expect(header.locator(":scope > [data-motion-toggle]")).toHaveCount(0);
  await expect(header.locator(":scope > .site-header__signal")).toHaveCount(0);
  const menu = header.locator("[data-motion-menu]");
  if ((await menu.getAttribute("open")) === null) {
    const summary = menu.locator(":scope > summary");
    const visible = await summary.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.top >= 0 &&
        bounds.left >= 0 &&
        bounds.bottom <= innerHeight &&
        bounds.right <= innerWidth
      );
    });
    if (!visible) await summary.scrollIntoViewIfNeeded();
    await expect(summary).toBeInViewport();
    const bounds = await summary.boundingBox();
    if (bounds === null)
      throw new Error("The visible menu trigger must have painted geometry.");
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
  }
  await expect(menu).toHaveAttribute("open", "");
  const toggle = menu.locator(".menu-motion-console [data-motion-toggle]");
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAccessibleName(/\S+/u);
  const bounds = await toggle.boundingBox();
  if (bounds === null) throw new Error("Consumer motion control must paint.");
  expect(bounds.width).toBeGreaterThanOrEqual(MINIMUM_CONTROL_SIZE_PX);
  expect(bounds.height).toBeGreaterThanOrEqual(MINIMUM_CONTROL_SIZE_PX);
  return toggle;
}

/** Real Escape restores the navigation trigger after settings are used. */
export async function closeConsumerMotionControls(page: Page): Promise<void> {
  const menu = page.locator(".site-header [data-motion-menu]");
  if ((await menu.getAttribute("open")) !== null) {
    await page.keyboard.press("Escape");
  }
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(menu.locator(":scope > summary")).toBeFocused();
}

/** Entry preferences are optional native disclosure, not an unavoidable console. */
export async function openEntryMotionControls(page: Page): Promise<void> {
  const settings = page.locator(
    "[data-responsible-entry] .entry-motion-options",
  );
  await expect(settings).not.toHaveAttribute("open", "");
  const summary = settings.locator(":scope > summary");
  await summary.focus();
  await expect(summary).toBeFocused();
  await summary.press("Enter");
  await expect(settings).toHaveAttribute("open", "");
  await expect(settings.locator("[data-motion-preference]")).toHaveCount(4);
}
