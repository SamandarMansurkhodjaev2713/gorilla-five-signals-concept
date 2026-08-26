import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoHorizontalOverflow, localizedPath } from "./support/site";

const DESKTOP_VIEWPORT = { height: 900, width: 1_440 } as const;
const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;
const HOME_CHAPTER_SELECTORS = [
  ".manifesto",
  ".flavor-reactor",
  ".home-truth-duel",
  ".home-material-film",
  ".tashkent-terminal",
  ".home-service-dock",
] as const;
const MOBILE_HEIGHT_RANGE = { maximum: 10_800, minimum: 7_400 } as const;

async function openHome(page: Page, motion = "static"): Promise<void> {
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await page.goto(localizedPath("uz", `?motion=${motion}`), {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => document.fonts.ready);
}

async function expectInlineFit(locator: Locator): Promise<void> {
  const metrics = await locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test.describe("homepage authored chapter system", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN the desktop homepage WHEN every post-hero act renders THEN six distinct complete chapters remain visible", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openHome(page);
    await expectNoHorizontalOverflow(page);

    for (const selector of HOME_CHAPTER_SELECTORS) {
      const chapter = page.locator(selector);
      await expect(chapter).toBeVisible();
      await testInfo.attach(`desktop-${selector.slice(1)}`, {
        body: await chapter.screenshot({ animations: "disabled" }),
        contentType: "image/png",
      });
    }

    await expect(page.locator(".home-truth__register li")).toHaveCount(5);
    await expect(page.locator(".home-material-film__stage")).toBeVisible();
    await expect(page.locator(".tashkent-terminal__locator")).toBeVisible();
  });

  test("GIVEN the 390px homepage WHEN the journey is read vertically THEN type fits and the composition stays deliberate", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await openHome(page);
    await expectNoHorizontalOverflow(page);

    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(documentHeight).toBeGreaterThanOrEqual(MOBILE_HEIGHT_RANGE.minimum);
    expect(documentHeight).toBeLessThanOrEqual(MOBILE_HEIGHT_RANGE.maximum);
    await expectInlineFit(page.locator(".reactor-intro h2 span").first());
    await expectInlineFit(page.locator(".reactor-intro h2 span").last());
    await expectInlineFit(page.locator(".home-service-dock__contact > strong"));

    for (const selector of HOME_CHAPTER_SELECTORS) {
      await testInfo.attach(`mobile-${selector.slice(1)}`, {
        body: await page
          .locator(selector)
          .screenshot({ animations: "disabled" }),
        contentType: "image/png",
      });
    }
  });

  test("GIVEN rapid flavor changes WHEN transition timelines are interrupted THEN one world survives and departure state is cleaned", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openHome(page, "full");
    const reactor = page.locator(".flavor-reactor");
    const selectors = reactor.locator("[data-product-selector]");

    for (const index of [1, 4, 2, 3, 0, 4]) {
      await selectors.nth(index).click();
    }

    await expect(reactor).toHaveAttribute(
      "data-selected-product",
      "lychee-pear",
    );
    await expect(reactor.locator("[data-motion-selected]")).toHaveCount(1);
    await expect(reactor.locator("[data-reactor-leaving]")).toHaveCount(0);
  });
});

test.describe("homepage resilient baselines", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN reduced motion WHEN the homepage renders THEN spatial loops are absent and content remains available", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await openHome(page, "reduced");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(
      page.locator(".reactor-world[data-motion-selected]"),
    ).toHaveCount(1);
    await expect(page.locator(".manifesto-transmission i")).toHaveCSS(
      "animation-name",
      "none",
    );
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("GIVEN scripts are unavailable WHEN the reactor renders THEN all products remain in one native snap rail", async ({
      page,
    }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(localizedPath("uz"), { waitUntil: "domcontentloaded" });
      const worlds = page.locator(".reactor-worlds");
      const metrics = await worlds.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollSnapType: getComputedStyle(element).scrollSnapType,
        scrollWidth: element.scrollWidth,
      }));

      await expect(page.locator(".reactor-console")).toBeHidden();
      await expect(page.locator(".reactor-world")).toHaveCount(5);
      expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth * 4);
      expect(metrics.scrollSnapType).toContain("mandatory");
    });
  });
});
