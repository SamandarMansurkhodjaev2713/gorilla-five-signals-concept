import { expect, test, type Page } from "@playwright/test";

import { acceptResponsibleEntry, expectSemanticPage } from "./support/site";

const DESKTOP_VIEWPORT = { height: 900, width: 1_440 } as const;
const SCROLL_RESTORE_TOLERANCE_PX = 12;

async function navigateFromSignalMenu(page: Page, href: string): Promise<void> {
  const menu = page.locator("[data-motion-menu]");
  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await menu.locator(`a[href="${href}"]`).click();
}

test.describe("route transition lifecycle", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expectSemanticPage(page, "uz");
    await acceptResponsibleEntry(page);
  });

  test("GIVEN a same-origin navigation WHEN the next document is ready THEN focus lands on its h1 without changing the scroll contract", async ({
    page,
  }) => {
    await navigateFromSignalMenu(page, "/uz/compare/");

    await expect(page).toHaveURL(/\/uz\/compare\/\?products=original%2Czero$/u);
    await expect(page.locator("main h1")).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => history.scrollRestoration))
      .toBe("manual");
  });

  test("GIVEN a scrolled route WHEN navigation is followed by browser Back THEN the previous scroll position is restored", async ({
    page,
  }) => {
    await navigateFromSignalMenu(page, "/uz/compare/");
    await expect(page.locator("main h1")).toBeFocused();

    const expectedScrollY = await page.evaluate(() => {
      const maximumScrollY =
        document.documentElement.scrollHeight - innerHeight;
      const targetScrollY = Math.min(900, maximumScrollY);
      scrollTo(0, targetScrollY);
      return scrollY;
    });
    expect(expectedScrollY).toBeGreaterThan(0);

    await navigateFromSignalMenu(page, "/uz/contact/");
    await expect(page.locator("main h1")).toBeFocused();
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/uz\/compare\/\?products=original%2Czero$/u);

    await expect
      .poll(async () => {
        const restoredScrollY = await page.evaluate(() => scrollY);
        return Math.abs(restoredScrollY - expectedScrollY);
      })
      .toBeLessThanOrEqual(SCROLL_RESTORE_TOLERANCE_PX);
  });
});
