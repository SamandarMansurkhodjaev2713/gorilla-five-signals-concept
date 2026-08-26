import { expect, test } from "@playwright/test";

import { collectRuntimeErrors, expectSemanticPage } from "./support/site";

const ENTRY_CONTENT_SELECTOR = [
  ".entry-header",
  ".entry-age",
  "#responsible-entry-title",
  "#responsible-entry-warning",
  ".entry-motion",
  ".entry-language",
  ".entry-actions",
  ".entry-details",
].join(", ");

const ENTRY_VIEWPORTS = [
  { height: 844, width: 390 },
  { height: 915, width: 412 },
  { height: 1_024, width: 768 },
  { height: 390, width: 844 },
  { height: 768, width: 1_024 },
  { height: 900, width: 1_440 },
] as const;

test.describe("responsible entry and route signal continuity", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN an unconfirmed direct product visit WHEN the page starts THEN the responsible checkpoint is modal and Escape exposes the leave path", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz", "/products/original");
    const dialog = page.locator("[data-responsible-entry]");

    await expect(dialog).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveAttribute("open", "");
    await expect(dialog.locator("[data-responsible-leave]")).toBeFocused();
  });

  test("GIVEN the checkpoint viewport matrix WHEN entry is shown THEN all copy and actions remain inside the viewport without nested scrolling", async ({
    page,
  }) => {
    for (const viewport of ENTRY_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expectSemanticPage(page, "uz");
      const dialog = page.locator("[data-responsible-entry]");
      const geometry = await dialog
        .locator(ENTRY_CONTENT_SELECTOR)
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rectangle = element.getBoundingClientRect();
            return {
              bottom: rectangle.bottom,
              height: innerHeight,
              left: rectangle.left,
              right: rectangle.right,
              top: rectangle.top,
              width: innerWidth,
            };
          }),
        );

      expect(geometry.length).toBe(8);
      expect(
        geometry.every(
          (box) =>
            box.top >= 0 &&
            box.left >= 0 &&
            box.bottom <= box.height &&
            box.right <= box.width,
        ),
        `${String(viewport.width)}x${String(viewport.height)}: ${JSON.stringify(geometry)}`,
      ).toBe(true);
      const scrollGeometry = await dialog.evaluate((element) => ({
        clientHeight: element.clientHeight,
        innerHeight,
        scrollHeight: element.scrollHeight,
      }));
      expect(
        scrollGeometry.scrollHeight,
        `${String(viewport.width)}x${String(viewport.height)}: ${JSON.stringify(scrollGeometry)}`,
      ).toBeLessThanOrEqual(scrollGeometry.innerHeight + 1);
      if (
        (viewport.width === 390 && viewport.height === 844) ||
        (viewport.width === 844 && viewport.height === 390)
      ) {
        await page.screenshot({
          path: `.tmp/mobile-chrome-review/entry-${String(viewport.width)}x${String(viewport.height)}.png`,
        });
      }
      if (viewport.width === 390) {
        const titleRhythm = await dialog
          .locator("#responsible-entry-title")
          .evaluate((element) => {
            const style = getComputedStyle(element);
            return (
              Number.parseFloat(style.lineHeight) /
              Number.parseFloat(style.fontSize)
            );
          });
        expect(titleRhythm).toBeGreaterThanOrEqual(0.95);
      }
    }
  });

  test("GIVEN the boot scan has just started WHEN Continue is pressed THEN entry is immediate, focus is useful, and presentation cleanup completes", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz");
    const dialog = page.locator("[data-responsible-entry]");
    const release = page.locator("[data-entry-release]");

    await dialog.locator("[data-responsible-continue]").click();

    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(page.locator("main#main-content")).toBeFocused();
    await expect(page.locator("[data-responsible-marker]")).toHaveAttribute(
      "data-marker-visible",
      "true",
    );
    await expect
      .poll(() => release.getAttribute("data-release-active"))
      .toBeNull();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gorilla-responsible-entry-confirmed"),
        ),
      )
      .toBe("true");
  });

  test("GIVEN Full is selected at entry WHEN Continue is pressed THEN the authored tier reaches the runtime and remains visibly discoverable", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectSemanticPage(page, "uz");
    const dialog = page.locator("[data-responsible-entry]");
    const full = dialog.locator('[data-motion-preference="full"]');

    await expect(
      dialog.locator('[data-motion-preference="system"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await full.click();
    await expect(full).toHaveAttribute("aria-pressed", "true");
    await dialog.locator("[data-responsible-continue]").click();

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "full",
    );
    const headerToggle = page.locator(".site-header > [data-motion-toggle]");
    await expect(headerToggle).toBeVisible();
    await expect
      .poll(() =>
        headerToggle.evaluate((element) =>
          getComputedStyle(element, "::after").content.replaceAll('"', ""),
        ),
      )
      .toBe("To‘liq");
    await expect
      .poll(() =>
        page.evaluate(() =>
          localStorage.getItem("gorilla:motion-preference:v1"),
        ),
      )
      .toBe("full");
  });

  test("GIVEN Reduced is selected inside the checkpoint WHEN the system allows motion THEN entry and release CSS choreography stop immediately", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectSemanticPage(page, "uz");
    const dialog = page.locator("[data-responsible-entry]");

    await dialog.locator('[data-motion-preference="reduced"]').click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-preference",
      "reduced",
    );
    await expect
      .poll(() =>
        dialog
          .locator(".entry-scan")
          .evaluate((element) => getComputedStyle(element).animationName),
      )
      .toBe("none");

    await dialog.locator("[data-responsible-continue]").click();

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect
      .poll(() =>
        page
          .locator("[data-entry-release] span")
          .first()
          .evaluate((element) => getComputedStyle(element).animationName),
      )
      .toBe("none");
  });

  test("GIVEN System is retained with reduced motion WHEN entry completes THEN content stays usable and the reduced tier is explicit", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 915, width: 412 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectSemanticPage(page, "uz");
    const dialog = page.locator("[data-responsible-entry]");

    await expect(
      dialog.locator('[data-motion-preference="system"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await dialog.locator("[data-responsible-continue]").click();

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-motion",
      "reduced",
    );
  });

  test("GIVEN entry is confirmed WHEN route requests race THEN the latest URL, heading focus, and idle signal state win", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.addInitScript(() => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem("gorilla:motion-preference:v1", "full");
    });
    await expectSemanticPage(page, "uz");

    await page
      .locator('.desktop-navigation a[href="/uz/compare/"]')
      .dispatchEvent("click");
    await page
      .locator('.desktop-navigation a[href="/uz/contact/"]')
      .dispatchEvent("click");

    await expect(page).toHaveURL(/\/uz\/contact\/$/u);
    await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator("[data-route-signal-code]")).toHaveText(
      "CONTACT",
    );
    await expect
      .poll(() =>
        page.locator("[data-route-signal]").getAttribute("data-route-phase"),
      )
      .toBe("idle");
    expect(errors).toEqual([]);
  });

  test("GIVEN reduced motion is active WHEN a route changes THEN navigation and focus remain while the spatial signal stays disabled", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectSemanticPage(page, "uz");

    const menu = page.locator("[data-motion-menu]");
    await menu.locator(":scope > summary").click();
    await expect(menu).toHaveAttribute("open", "");
    await expect(menu.locator("[data-motion-menu-panel]")).toBeVisible();
    await menu.locator('nav a[href="/uz/faq/"]').click();

    await expect(page).toHaveURL(/\/uz\/faq\/$/u);
    await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-motion",
      "reduced",
    );
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-phase",
      "idle",
    );
  });

  test("GIVEN legal information is requested directly WHEN no confirmation exists THEN the legal route stays readable without a circular gate", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz", "/legal/product-information");

    await expect(page.locator("[data-responsible-entry]")).toHaveCount(0);
    await expect(page.locator("main h1")).toBeVisible();
  });
});
