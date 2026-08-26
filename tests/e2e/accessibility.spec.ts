import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  LOCALES,
  ROUTE_SUFFIXES,
  acceptResponsibleEntry,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const PAGE_LEAD_REFLOW_ROUTES = ["/compare", "/contact"] as const;
const PAGE_LEAD_REFLOW_VIEWPORTS = [
  { height: 844, width: 390 },
  { height: 844, width: 412 },
  { height: 1_024, width: 768 },
  { height: 900, width: 1_440 },
] as const;

test.describe("automated accessibility", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const locale of LOCALES) {
    for (const suffix of ROUTE_SUFFIXES) {
      test(`GIVEN ${locale}${suffix || "/"} WHEN WCAG 2.2 AA rules run THEN no violations are reported`, async ({
        page,
      }) => {
        await expectSemanticPage(page, locale, suffix);
        await acceptResponsibleEntry(page);
        const result = await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ])
          .analyze();

        expect(
          result.violations,
          `${locale}${suffix || "/"}: ${result.violations
            .map((violation) => violation.id)
            .join(", ")}`,
        ).toEqual([]);
      });
    }
  }

  test("GIVEN keyboard-only navigation WHEN skip navigation is activated THEN focus reaches the main content", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
    await expectSemanticPage(page, "uz");
    await page.keyboard.press("Tab");

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("GIVEN the compact viewport WHEN interactive controls are measured THEN essential controls meet the practical target size", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await expectSemanticPage(page, "uz");
    await acceptResponsibleEntry(page);

    const undersizedControls = await page
      .locator(
        "a[href], button, summary, input, select, textarea, [role='button'], [data-motion-toggle]",
      )
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return (
              element.getClientRects().length > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              (rect.width < 44 || rect.height < 44)
            );
          })
          .map((element) => ({
            element: element.outerHTML.slice(0, 160),
            height: Math.round(element.getBoundingClientRect().height),
            width: Math.round(element.getBoundingClientRect().width),
          })),
      );

    expect(undersizedControls).toEqual([]);
  });

  test("GIVEN the mobile menu WHEN it opens and closes THEN focus, modal semantics, Escape, and background inertness are deterministic", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await expectSemanticPage(page, "uz");
    await acceptResponsibleEntry(page);

    const menu = page.locator("[data-motion-menu]");
    const summary = menu.locator("summary");
    await summary.click();

    const panel = menu.locator("[data-motion-menu-panel]");
    await expect(panel).toHaveAttribute("role", "dialog");
    await expect(panel).toHaveAttribute("aria-modal", "true");
    await expect(page.locator("main#main-content")).toHaveAttribute(
      "inert",
      "",
    );
    await expect(menu.locator("[data-motion-menu-close]")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
    await expect(page.locator("main#main-content")).not.toHaveAttribute(
      "inert",
      "",
    );
  });

  test("GIVEN WCAG text spacing and 200% root text WHEN the core journey renders THEN content remains operable without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await expectSemanticPage(page, "uz");
    await acceptResponsibleEntry(page);
    await page.addStyleTag({
      content: `
        html { font-size: 200% !important; }
        * { letter-spacing: 0.12em !important; line-height: 1.5 !important; word-spacing: 0.16em !important; }
        p { margin-block-end: 2em !important; }
      `,
    });

    await expect(page.locator("[data-product-previous]")).toBeVisible();
    await expect(page.locator("[data-product-next]")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
  });

  test("GIVEN forced colors and higher contrast preferences WHEN interactive pages render THEN essential controls keep visible boundaries", async ({
    page,
  }) => {
    await page.emulateMedia({ contrast: "more", forcedColors: "active" });
    await expectSemanticPage(page, "uz", "/compare");

    const controls = page.locator(
      "[data-compare-root] button, [data-compare-root] select, [data-compare-root] a",
    );
    await expect(controls.first()).toBeVisible();
    const invisibleBoundaries = await controls.evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.borderStyle === "none" &&
            style.outlineStyle === "none" &&
            style.textDecorationLine === "none"
          );
        })
        .map((element) => element.outerHTML.slice(0, 120)),
    );
    expect(invisibleBoundaries).toEqual([]);
  });

  for (const suffix of PAGE_LEAD_REFLOW_ROUTES) {
    for (const viewport of PAGE_LEAD_REFLOW_VIEWPORTS) {
      test(`GIVEN ${suffix} at ${String(viewport.width)}px WHEN Uzbek display copy renders THEN every glyph remains within the viewport`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await expectSemanticPage(page, "uz", suffix);
        await acceptResponsibleEntry(page);
        await expectNoHorizontalOverflow(page);
      });
    }
  }

  test("GIVEN forced colors and reduced motion WHEN the longest Uzbek page leads render THEN reflow remains intact", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({
      contrast: "more",
      forcedColors: "active",
      reducedMotion: "reduce",
    });

    for (const suffix of PAGE_LEAD_REFLOW_ROUTES) {
      await expectSemanticPage(page, "uz", suffix);
      await acceptResponsibleEntry(page);
      await expectNoHorizontalOverflow(page);
    }
  });
});
