import { expect, test, type Page } from "@playwright/test";

import { collectRuntimeErrors } from "./support/site";

const UNDERLYING_ROOTS = [
  ".skip-link",
  ".site-header",
  "main[data-route-content]",
  ".site-footer",
] as const;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;
const ROUTES = ["/uz/", "/uz/products/original/"] as const;

declare global {
  interface Window {
    __entryPaintAtContinue?: {
      readonly visibility: string;
      readonly dialogOpen: boolean;
    };
  }
}

async function expectPaintState(page: Page, visibility: "hidden" | "visible") {
  for (const selector of UNDERLYING_ROOTS) {
    await expect(page.locator(`body > ${selector}`)).toHaveCSS(
      "visibility",
      visibility,
    );
  }
}

async function preferReduced(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("gorilla:motion-preference:v1", "reduced");
  });
}

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`GIVEN fresh entry at ${viewport.width}px on ${route} WHEN confirmed, reloaded and navigated THEN occluded paint is released with native focus and content`, async ({
      page,
    }) => {
      const errors = await collectRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await preferReduced(page);
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      const dialog = page.locator("[data-responsible-entry]");
      await expect(dialog).toBeVisible();
      await expect
        .poll(() => dialog.evaluate((element) => element.matches(":modal")))
        .toBe(true);
      await expectPaintState(page, "hidden");
      await expect(page.locator("main img").first()).toHaveCSS(
        "visibility",
        "hidden",
      );
      const scrollBefore = await page.evaluate(() => scrollY);
      await dialog.locator("[data-responsible-continue]").evaluate((button) => {
        button.addEventListener(
          "click",
          () => {
            const main = document.querySelector("main");
            const entry = document.querySelector("dialog");
            if (!(entry instanceof HTMLDialogElement) || main === null)
              throw new Error("The entry/main contract is missing.");
            window.__entryPaintAtContinue = {
              visibility: getComputedStyle(main).visibility,
              dialogOpen: entry.open,
            };
          },
          { once: true },
        );
      });
      await dialog.locator("[data-responsible-continue]").click();
      expect(await page.evaluate(() => window.__entryPaintAtContinue)).toEqual({
        visibility: "visible",
        dialogOpen: false,
      });
      await expect(dialog).not.toHaveAttribute("open", "");
      await expectPaintState(page, "visible");
      await expect(page.locator("main#main-content")).toBeFocused();
      expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
      await page.reload();
      await expect(dialog).not.toHaveAttribute("open", "");
      await expectPaintState(page, "visible");
      await page.locator("[data-responsible-marker] a").click();
      await expect(page).toHaveURL(/\/uz\/legal\/product-information\/$/u);
      await expect(page.locator("[data-responsible-entry]")).toHaveCount(0);
      await expectPaintState(page, "visible");
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`${route}$`, "u"));
      await expect(dialog).not.toHaveAttribute("open", "");
      await expectPaintState(page, "visible");
      expect(errors).toEqual([]);
    });
  }

  test(`GIVEN no JavaScript at ${viewport.width}px WHEN responsible entry has its SSR open attribute THEN fallback content remains painted and reachable`, async ({
    browser,
    baseURL,
  }) => {
    if (baseURL === undefined)
      throw new Error("A preview base URL is required.");
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport,
    });
    try {
      const page = await context.newPage();
      await page.goto("/uz/");
      await expect(page.locator("[data-responsible-entry]")).toHaveAttribute(
        "open",
        "",
      );
      await expect(page.locator("[data-responsible-entry]")).toBeHidden();
      await expectPaintState(page, "visible");
      await expect(page.locator(".responsible-fallback")).toBeVisible();
      await expect(page.locator("main h1")).toBeVisible();
      await page.locator(".responsible-fallback a").click();
      await expect(page).toHaveURL(/\/uz\/legal\/product-information\/$/u);
      await expectPaintState(page, "visible");
    } finally {
      await context.close();
    }
  });
}

test("GIVEN an opaque checkpoint WHEN underlying visibility is isolated THEN its layout geometry is retained", async ({
  page,
}) => {
  await preferReduced(page);
  await page.goto("/uz/");
  await page.evaluate(() => document.fonts.ready);
  await expectPaintState(page, "hidden");
  // Explicit CSS isolation, not user input or performance evidence.
  const experiment = await page.evaluate((selectors) => {
    const elements = selectors.map((selector) =>
      document.querySelector(`body > ${selector}`),
    );
    const snapshots = elements.map(
      (element) => element?.getAttribute("style") ?? null,
    );
    const measure = () =>
      elements.map((element) => {
        if (!(element instanceof HTMLElement))
          throw new Error("An underlying root is missing.");
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
    const hidden = measure();
    try {
      for (const element of elements) {
        if (!(element instanceof HTMLElement))
          throw new Error("An underlying root is missing.");
        element.style.setProperty("visibility", "visible", "important");
      }
      return { hidden, visible: measure() };
    } finally {
      elements.forEach((element, index) => {
        const style = snapshots[index];
        if (style === null) element?.removeAttribute("style");
        else if (style !== undefined) element?.setAttribute("style", style);
      });
    }
  }, UNDERLYING_ROOTS);
  expect(experiment.visible).toEqual(experiment.hidden);
  await expectPaintState(page, "hidden");
});

test("GIVEN an unconfirmed locale change WHEN the native entry language link is followed THEN the translated opaque checkpoint retains paint ownership", async ({
  page,
}) => {
  const errors = await collectRuntimeErrors(page);
  await page.setViewportSize(VIEWPORTS[0]);
  await preferReduced(page);
  await page.goto("/uz/");
  await expectPaintState(page, "hidden");
  await page.locator('.entry-language a[lang="ru"]').click();
  await expect(page).toHaveURL(/\/ru\/$/u);
  await expect(page.locator("[data-responsible-entry]")).toBeVisible();
  await expectPaintState(page, "hidden");
  await page.locator(".entry-details").click();
  await expect(page).toHaveURL(/\/ru\/legal\/product-information\/$/u);
  await expectPaintState(page, "visible");
  expect(errors).toEqual([]);
});
