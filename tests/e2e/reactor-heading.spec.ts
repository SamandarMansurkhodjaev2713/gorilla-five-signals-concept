import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectSemanticPage, LOCALES } from "./support/site";

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;
const MINIMUM_HEADING_SIZE_PX = 32;
const GEOMETRY_TOLERANCE_PX = 1;
const CONSUMER_HEADING_SELECTORS = [
  ".reactor-intro h2",
  ".tashkent-terminal__locator > strong",
  ".home-service-dock__contact > strong",
] as const;

async function expectCompleteHeading(heading: Locator): Promise<void> {
  const geometry = await heading.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    return {
      size: Number.parseFloat(getComputedStyle(element).fontSize),
      lineHeightRatio:
        Number.parseFloat(getComputedStyle(element).lineHeight) /
        Number.parseFloat(getComputedStyle(element).fontSize),
      left: bounds.left,
      right: bounds.right,
      lines: Array.from(range.getClientRects(), (rect) => ({
        left: rect.left,
        right: rect.right,
      })),
    };
  });
  expect(geometry.size).toBeGreaterThanOrEqual(MINIMUM_HEADING_SIZE_PX);
  expect(geometry.lineHeightRatio).toBeGreaterThanOrEqual(0.949);
  expect(geometry.lines.length).toBeGreaterThan(0);
  for (const line of geometry.lines) {
    expect(line.left).toBeGreaterThanOrEqual(
      geometry.left - GEOMETRY_TOLERANCE_PX,
    );
    expect(line.right).toBeLessThanOrEqual(
      geometry.right + GEOMETRY_TOLERANCE_PX,
    );
  }
}

async function expectConsumerHeadings(page: Page): Promise<void> {
  for (const selector of CONSUMER_HEADING_SELECTORS) {
    await expectCompleteHeading(page.locator(selector));
  }
}

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test(`GIVEN ${locale} at ${viewport.width}px WHEN native and enlarged text render THEN range and action headings remain complete`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() =>
        sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
      );
      await expectSemanticPage(page, locale, "?motion=static");
      await page.evaluate(() => document.fonts.ready);
      const intro = page.locator(".reactor-intro");
      const heading = intro.locator("h2");
      await expect(intro.locator("p")).toHaveCount(0);
      await expect(heading).toHaveAttribute("aria-label", /\S+/u);
      await expectConsumerHeadings(page);
      await page.addStyleTag({
        content:
          "html { font-size: 200%; } .reactor-intro h2 { line-height: 1.5; letter-spacing: .12em; word-spacing: .16em; }",
      });
      await expectConsumerHeadings(page);
    });
  }
}
