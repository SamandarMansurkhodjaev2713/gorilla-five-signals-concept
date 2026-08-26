import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  acceptResponsibleEntry,
  expectNoHorizontalOverflow,
  localizedPath,
} from "./support/site";

const AUDIT_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
] as const;

interface TextMetrics {
  readonly inlineOverflow: number;
  readonly lineCount: number;
  readonly lineHeightRatio: number;
  readonly narrowestLineRatio: number;
}

async function readTextMetrics(locator: Locator): Promise<TextMetrics> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const range = document.createRange();
    range.selectNodeContents(element);
    const lineWidths = Array.from(
      range.getClientRects(),
      ({ width }) => width,
    ).filter((width) => width > 0.5);
    const widestLine = Math.max(...lineWidths, 1);

    return {
      inlineOverflow: element.scrollWidth - element.clientWidth,
      lineCount: lineWidths.length,
      lineHeightRatio:
        Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize),
      narrowestLineRatio: Math.min(...lineWidths, widestLine) / widestLine,
    };
  });
}

async function openAcceptedHome(page: Page): Promise<void> {
  await page.goto(localizedPath("uz"), { waitUntil: "domcontentloaded" });
  await acceptResponsibleEntry(page);
}

async function expectMobileTypeIntegrity(page: Page): Promise<void> {
  const reactorHeading = page.locator(".reactor-intro h2");
  const reactor = await readTextMetrics(reactorHeading);
  const reactorLines = await reactorHeading
    .locator("span")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
    );
  const terminal = await readTextMetrics(
    page.locator(".tashkent-terminal__copy h2"),
  );
  const locator = await readTextMetrics(
    page.locator(".tashkent-terminal__locator > strong"),
  );
  const contact = await readTextMetrics(
    page.locator(".home-service-dock__contact > strong"),
  );

  expect(reactor.inlineOverflow).toBeLessThanOrEqual(1);
  expect(reactorLines).toHaveLength(2);
  for (const line of reactorLines) {
    expect(line.scrollWidth).toBeLessThanOrEqual(line.clientWidth + 1);
  }
  expect(reactor.lineHeightRatio).toBeGreaterThanOrEqual(0.899);
  expect(terminal.inlineOverflow).toBeLessThanOrEqual(1);
  expect(terminal.lineHeightRatio).toBeGreaterThanOrEqual(0.85);
  expect(terminal.narrowestLineRatio).toBeGreaterThan(0.28);
  expect(locator.inlineOverflow).toBeLessThanOrEqual(1);
  expect(locator.lineCount).toBeLessThanOrEqual(2);
  expect(locator.narrowestLineRatio).toBeGreaterThan(0.42);
  expect(contact.inlineOverflow).toBeLessThanOrEqual(1);
  expect(contact.lineCount).toBe(1);
}

async function expectMobileRailAndOutro(page: Page): Promise<void> {
  const rail = page.locator(".manifesto-rail ol");
  const railState = await rail.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      isScrollable: element.scrollWidth > element.clientWidth,
      scrollSnapType: style.scrollSnapType,
      scrollbarWidth: style.scrollbarWidth,
      tabIndex: element.getAttribute("tabindex"),
    };
  });
  const footer = page.locator("footer.site-footer");
  await footer.scrollIntoViewIfNeeded();
  const footerHeight = await footer.evaluate(
    (element) => element.getBoundingClientRect().height,
  );

  await expect(page.locator(".manifesto-rail-hint")).toBeVisible();
  await expect(page.locator(".footer-notes-disclosure")).toBeVisible();
  expect(railState.isScrollable).toBe(true);
  expect(railState.scrollSnapType).toContain("mandatory");
  expect(railState.scrollbarWidth).toBe("none");
  expect(railState.tabIndex).toBe("0");
  expect(footerHeight).toBeLessThanOrEqual(800);
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`mobile typography and outro / ${reducedMotion}`, () => {
    for (const viewport of AUDIT_VIEWPORTS) {
      test(`GIVEN ${viewport.width}x${viewport.height} WHEN home renders THEN editorial type stays readable and the outro fits`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion });
        await page.setViewportSize(viewport);
        await openAcceptedHome(page);
        await expectNoHorizontalOverflow(page);

        if (viewport.width <= 412) {
          await expectMobileTypeIntegrity(page);
          await expectMobileRailAndOutro(page);
        }

        if (reducedMotion === "reduce" && viewport.width <= 412) {
          await expect(page.locator(".manifesto-rail-hint b")).toHaveCSS(
            "animation-name",
            "none",
          );
        }
      });
    }
  });
}

test.describe("mobile outro without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("GIVEN JavaScript is absent WHEN the footer opens THEN navigation and legal notes remain available", async ({
    page,
  }) => {
    await page.setViewportSize(AUDIT_VIEWPORTS[0]);
    await page.goto(localizedPath("uz"), { waitUntil: "domcontentloaded" });

    const footer = page.locator("footer.site-footer");
    const disclosure = footer.locator(".footer-notes-disclosure");
    await expect(footer.locator("nav a")).toHaveCount(11);
    await expect(footer.locator(".motion-console")).toBeHidden();
    const products = footer.locator(".footer-products");
    await products.locator("summary").click();
    await expect(products.locator("nav a")).toHaveCount(5);
    await expect(disclosure).toBeVisible();
    await expect(disclosure.locator(".footer-notes")).toBeHidden();
    await disclosure.locator("summary").click();
    await expect(disclosure.locator(".footer-notes")).toBeVisible();
    await expect(page.locator(".manifesto-rail ol")).toHaveAttribute(
      "tabindex",
      "0",
    );
  });
});
