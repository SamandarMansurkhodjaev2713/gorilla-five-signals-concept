import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";

async function focusAnchor(target: Locator): Promise<void> {
  await target.evaluate((element) => {
    if (!(element instanceof HTMLAnchorElement))
      throw new Error("Missing focusable background anchor.");
    element.focus();
  });
}

async function verifyVisibleFocusableAnchor(target: Locator): Promise<void> {
  await expect(target).toBeVisible();
  const bounds = await target.boundingBox();
  expect(bounds?.width).toBeGreaterThan(0);
  expect(bounds?.height).toBeGreaterThan(0);
  expect(
    await target.evaluate((element) => {
      if (!(element instanceof HTMLAnchorElement)) return false;
      const style = getComputedStyle(element);
      return (
        element.hasAttribute("href") &&
        element.tabIndex >= 0 &&
        style.visibility === "visible" &&
        style.display !== "none"
      );
    }),
  ).toBe(true);
}

/** Native modality blocks a real focusable target, not merely a reflected attribute. */
export async function verifyNativeModalFocusBoundary(
  dialog: Locator,
  backgroundTarget: Locator,
): Promise<void> {
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(
    true,
  );
  await verifyVisibleFocusableAnchor(backgroundTarget);
  await focusAnchor(backgroundTarget);
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
}

/** The same target must focus after closing; this rejects a vacuous blocking test. */
export async function verifyNonmodalFocusCounterControl(
  dialog: Locator,
  backgroundTarget: Locator,
): Promise<void> {
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(
    false,
  );
  await focusAnchor(backgroundTarget);
  await expect(backgroundTarget).toBeFocused();
}
