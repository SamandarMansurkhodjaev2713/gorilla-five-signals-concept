import { expect, test, type Page } from "@playwright/test";

import { expectNoHorizontalOverflow } from "./support/site";

const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const PREFERENCE_KEY = "gorilla:motion-preference:v1";
const CHROME_VIEWPORTS = [
  { height: 844, width: 390 },
  { height: 915, width: 412 },
  { height: 1_024, width: 768 },
  { height: 390, width: 844 },
] as const;

async function openConfirmedPage(page: Page, path = "/uz/"): Promise<void> {
  await page.addInitScript(
    ({ confirmationKey, preferenceKey }) => {
      sessionStorage.setItem(confirmationKey, "true");
      localStorage.setItem(preferenceKey, "full");
    },
    { confirmationKey: CONFIRMATION_KEY, preferenceKey: PREFERENCE_KEY },
  );
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "full",
  );
}

test.describe("mobile chrome art direction and resilience", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN the mobile and tablet matrix WHEN chrome renders THEN status, safe geometry, targets, and the compact outro remain intact", async ({
    page,
  }) => {
    for (const viewport of CHROME_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await openConfirmedPage(page);
      const header = page.locator(".site-header");
      const motionStatus = header.locator(":scope > [data-motion-toggle]");
      const menu = header.locator(".mobile-navigation > summary");
      const footer = page.locator("footer.site-footer");

      await expect(motionStatus).toBeVisible();
      await expect(menu).toBeVisible();
      const geometry = await page
        .locator(
          ".site-header .brand, .site-header > [data-motion-toggle], .site-header .mobile-navigation > summary",
        )
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rectangle = element.getBoundingClientRect();
            return { height: rectangle.height, width: rectangle.width };
          }),
        );
      expect(
        geometry.every(
          (rectangle) => Math.min(rectangle.height, rectangle.width) >= 44,
        ),
      ).toBe(true);
      await expectNoHorizontalOverflow(page);

      await footer.scrollIntoViewIfNeeded();
      const footerHeight = await footer.evaluate(
        (element) => element.getBoundingClientRect().height,
      );
      expect(footerHeight).toBeLessThanOrEqual(800);
      await expect(
        footer.locator(".motion-console > summary strong"),
      ).toHaveText("To‘liq");
      if (viewport.width === 390 && viewport.height === 844) {
        await footer.screenshot({
          path: ".tmp/mobile-chrome-review/footer-390.png",
        });
      }
    }
  });

  test("GIVEN a compact phone WHEN the menu opens THEN navigation, mode controls, locale controls, focus, and the safe area form one coherent sheet", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await openConfirmedPage(page);
    const menu = page.locator("[data-motion-menu]");
    await menu.locator("summary").click();

    const panel = menu.locator("[data-motion-menu-panel]");
    await expect(panel).toHaveAttribute("role", "dialog");
    await expect(panel).toHaveAttribute("aria-modal", "true");
    await expect(menu.locator("[data-motion-menu-close]")).toBeFocused();
    await expect(panel.locator("nav a")).toHaveCount(6);
    await expect(panel.locator("[data-motion-preference]")).toHaveCount(4);
    await expect(panel.locator(".menu-locales a")).toHaveCount(3);
    await expectNoHorizontalOverflow(page);

    await page.screenshot({
      path: ".tmp/mobile-chrome-review/menu-390x844.png",
    });
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open", "");
  });

  test("GIVEN the Products archive is scrolled live WHEN every chapter crosses the sticky scan THEN the header owns the top chrome layer", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1_440 });
    await openConfirmedPage(page, "/uz/products/#signal-original");
    const chapters = page.locator("[data-atlas-panel]");
    await expect(chapters).toHaveCount(5);

    for (let index = 0; index < 5; index += 1) {
      await chapters.nth(index).scrollIntoViewIfNeeded();
      const layer = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        if (header === null) {
          return null;
        }
        const rectangle = header.getBoundingClientRect();
        const probe = document.elementFromPoint(
          Math.min(24, innerWidth - 1),
          Math.max(1, rectangle.bottom - 2),
        );
        return {
          headerBottom: rectangle.bottom,
          headerTop: rectangle.top,
          ownsProbe: probe?.closest(".site-header") === header,
          position: getComputedStyle(header).position,
          zIndex: Number.parseInt(getComputedStyle(header).zIndex, 10),
        };
      });
      expect(layer).not.toBeNull();
      expect(layer?.headerTop).toBe(0);
      expect(layer?.ownsProbe).toBe(true);
      expect(layer?.position).toBe("sticky");
      expect(layer?.zIndex).toBeGreaterThanOrEqual(60);
    }
  });
});

test.describe("chrome without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("GIVEN scripts are unavailable WHEN chrome renders THEN native navigation and legal access survive without fake motion controls", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/uz/", { waitUntil: "domcontentloaded" });
    const menu = page.locator("[data-motion-menu]");

    await expect(page.locator("[data-responsible-entry]")).toBeHidden();
    await menu.locator("summary").click();
    await expect(menu.locator("nav a")).toHaveCount(6);
    await expect(page.locator("footer .motion-console")).toBeHidden();
    await expect(
      page.locator("footer a[href='/uz/legal/privacy/']"),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
