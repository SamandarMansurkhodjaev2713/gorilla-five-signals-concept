import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  localizedPath,
  PRODUCT_SLUGS,
} from "./support/site";

const VIEWPORTS = [
  { height: 800, name: "compact phone", width: 360 },
  { height: 844, name: "phone", width: 390 },
  { height: 1024, name: "portrait tablet", width: 768 },
  { height: 768, name: "landscape tablet", width: 1024 },
  { height: 900, name: "desktop", width: 1440 },
  { height: 1080, name: "wide desktop", width: 1920 },
  { height: 390, name: "phone landscape", width: 844 },
] as const;
const RESILIENT_VIEWPORTS = [VIEWPORTS[1], VIEWPORTS[4]] as const;
const MINIMUM_TARGET_SIZE_PX = 44;
const GEOMETRY_TOLERANCE_PX = 1;
const FONT_METRIC_TOLERANCE_PX = 3;
const REACTOR = "[data-product-explorer]";
const SELECTOR = "[data-product-selector]";
const ACTIVE_WORLD = "[data-product-card][data-motion-selected]";

interface Rectangle {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

async function openReactor(page: Page, query: string): Promise<Locator> {
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
  });
  await page.goto(localizedPath("uz", `?${query}`), {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => document.fonts.ready);
  const reactor = page.locator(REACTOR);
  await expect(reactor).toHaveAttribute("data-enhanced", "true");
  await reactor.scrollIntoViewIfNeeded();
  return reactor;
}

async function requiredRectangle(locator: Locator): Promise<Rectangle> {
  await expect(locator).toBeVisible();
  const rectangle = await locator.boundingBox();
  if (rectangle === null) {
    throw new Error(
      `No geometry for ${await locator.evaluate((node) => node.outerHTML)}`,
    );
  }
  expect(rectangle.width).toBeGreaterThan(0);
  expect(rectangle.height).toBeGreaterThan(0);
  return rectangle;
}

function overlapArea(first: Rectangle, second: Rectangle): number {
  const width = Math.max(
    0,
    Math.min(first.x + first.width, second.x + second.width) -
      Math.max(first.x, second.x),
  );
  const height = Math.max(
    0,
    Math.min(first.y + first.height, second.y + second.height) -
      Math.max(first.y, second.y),
  );
  return width * height;
}

async function expectNoOverlap(
  first: Locator,
  second: Locator,
  label: string,
): Promise<void> {
  const [firstRectangle, secondRectangle] = await Promise.all([
    requiredRectangle(first),
    requiredRectangle(second),
  ]);
  expect(
    overlapArea(firstRectangle, secondRectangle),
    label,
  ).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
}

async function expectInlineFit(
  locator: Locator,
  viewportWidth: number,
  label: string,
): Promise<void> {
  const rectangle = await requiredRectangle(locator);
  expect(rectangle.x, `${label}: left edge`).toBeGreaterThanOrEqual(
    -GEOMETRY_TOLERANCE_PX,
  );
  expect(
    rectangle.x + rectangle.width,
    `${label}: right edge`,
  ).toBeLessThanOrEqual(viewportWidth + GEOMETRY_TOLERANCE_PX);
  const overflow = await locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(overflow.scrollWidth, `${label}: inline content`).toBeLessThanOrEqual(
    overflow.clientWidth + FONT_METRIC_TOLERANCE_PX,
  );
}

async function expectTouchTargets(locator: Locator): Promise<void> {
  const failures = await locator.evaluateAll(
    (elements, minimumSize) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        const rectangle = element.getBoundingClientRect();
        const visible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rectangle.width > 0 &&
          rectangle.height > 0;
        return visible &&
          (rectangle.width < minimumSize || rectangle.height < minimumSize)
          ? [
              {
                height: rectangle.height,
                name:
                  element.getAttribute("aria-label") ??
                  element.textContent?.trim(),
                width: rectangle.width,
              },
            ]
          : [];
      }),
    MINIMUM_TARGET_SIZE_PX,
  );
  expect(failures).toEqual([]);
}

async function expectOneSelection(
  reactor: Locator,
  slug: (typeof PRODUCT_SLUGS)[number],
): Promise<Locator> {
  await expect(reactor).toHaveAttribute("data-selected-product", slug);
  await expect(reactor.locator(`${SELECTOR}[aria-pressed="true"]`)).toHaveCount(
    1,
  );
  await expect(
    reactor.locator(`${SELECTOR}[aria-pressed="true"]`),
  ).toHaveAttribute("data-product-selector", slug);
  await expect(reactor.locator(ACTIVE_WORLD)).toHaveCount(1);
  const activeWorld = reactor.locator(ACTIVE_WORLD);
  await expect(activeWorld).toHaveAttribute("data-product-card", slug);
  await expect(reactor.locator("[data-reactor-leaving]")).toHaveCount(0);
  return activeWorld;
}

async function expectProductContract(
  page: Page,
  reactor: Locator,
  slug: (typeof PRODUCT_SLUGS)[number],
  viewportWidth: number,
): Promise<void> {
  const activeWorld = await expectOneSelection(reactor, slug);
  const title = activeWorld.locator("h3");
  const can = activeWorld.locator(".reactor-can img");
  const actions = activeWorld.locator(".reactor-actions");
  await expect(title).not.toBeEmpty();
  await expect(
    activeWorld.locator(".reactor-copy__description"),
  ).not.toBeEmpty();
  await expect(activeWorld.locator(".reactor-actions a")).toHaveCount(2);
  await expect
    .poll(() =>
      can.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  for (const [label, critical] of [
    ["can", can],
    ["title", title],
    ["actions", actions],
  ] as const) {
    await expectInlineFit(critical, viewportWidth, `${slug}: ${label}`);
  }
  await expectNoOverlap(title, actions, `${slug}: title overlaps actions`);
  await expectNoOverlap(
    reactor.locator("[data-product-previous]"),
    reactor.locator("[data-product-next]"),
    `${slug}: previous and next controls overlap`,
  );
  await expectNoOverlap(
    activeWorld.locator(".reactor-actions a").first(),
    activeWorld.locator(".reactor-actions a").last(),
    `${slug}: product actions overlap`,
  );
  await expectNoHorizontalOverflow(page);
}

async function selectProduct(
  reactor: Locator,
  slug: (typeof PRODUCT_SLUGS)[number],
): Promise<void> {
  if ((await reactor.getAttribute("data-selected-product")) === slug) {
    await reactor.locator("[data-product-next]").click();
    await expect(reactor).not.toHaveAttribute("data-selected-product", slug);
  }
  await reactor.locator(`${SELECTOR}[data-product-selector="${slug}"]`).click();
  await expect(reactor).toHaveAttribute("data-selected-product", slug);
}

test.describe("Flavor Reactor independent QA contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const viewport of VIEWPORTS) {
    for (const slug of PRODUCT_SLUGS) {
      test(`GIVEN ${viewport.width}x${viewport.height} ${viewport.name} WHEN ${slug} is selected THEN geometry, semantics and touch targets remain valid`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        const reactor = await openReactor(
          page,
          `motion=static&product=${slug}`,
        );
        await selectProduct(reactor, slug);
        await expectProductContract(page, reactor, slug, viewport.width);
        const activeWorld = reactor.locator(ACTIVE_WORLD);
        const tray = reactor.locator("[data-comparison-tray]");
        await expect(tray).toBeVisible();
        await expectNoOverlap(
          tray,
          activeWorld.locator(".reactor-actions"),
          `${slug}: comparison tray obscures product CTA`,
        );
        await expectTouchTargets(
          reactor.locator(
            `${SELECTOR}, [data-product-previous], [data-product-next], ${ACTIVE_WORLD} .reactor-actions a, [data-comparison-link]`,
          ),
        );
      });
    }
  }

  test("GIVEN every supported deep link WHEN loaded and traversed through history THEN URL and selection stay synchronized", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS[1]);
    let reactor: Locator | null = null;
    for (const slug of PRODUCT_SLUGS) {
      reactor = await openReactor(page, `motion=static&product=${slug}`);
      await expectOneSelection(reactor, slug);
      await expect(page).toHaveURL(
        new RegExp(`[?&]product=${slug}(?:&|$)`, "u"),
      );
    }
    if (reactor === null) {
      throw new Error("Product catalog is unexpectedly empty.");
    }
    await reactor.locator('[data-product-selector="original"]').click();
    await expect(page).toHaveURL(/[?&]product=original(?:&|$)/u);
    await page.goBack();
    await expectOneSelection(reactor, "lychee-pear");
  });

  test("GIVEN keyboard-only intent WHEN stage, previous, next and selectors are used THEN controls preserve one shareable selection", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS[1]);
    const reactor = await openReactor(page, "motion=static&product=original");
    const stage = reactor.locator("[data-reactor-gesture]");
    await stage.focus();
    await page.keyboard.press("ArrowRight");
    await expectOneSelection(reactor, "zero");
    await page.keyboard.press("ArrowLeft");
    await expectOneSelection(reactor, "original");

    await reactor.locator("[data-product-next]").focus();
    await page.keyboard.press("Enter");
    await expectOneSelection(reactor, "zero");
    await reactor.locator("[data-product-previous]").focus();
    await page.keyboard.press("Space");
    await expectOneSelection(reactor, "original");
    await reactor.locator('[data-product-selector="extra"]').focus();
    await page.keyboard.press("Enter");
    await expectOneSelection(reactor, "extra");
    await page.keyboard.press("ArrowRight");
    await expectOneSelection(reactor, "mango-coconut");
    await expect(page).toHaveURL(/[?&]product=mango-coconut(?:&|$)/u);
  });

  for (const viewport of RESILIENT_VIEWPORTS) {
    test(`GIVEN reduced motion at ${viewport.width}x${viewport.height} WHEN all signals change THEN content and state remain readable without spatial residue`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      const reactor = await openReactor(
        page,
        "motion=reduced&product=original",
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      for (const slug of PRODUCT_SLUGS) {
        await selectProduct(reactor, slug);
        await expectProductContract(page, reactor, slug, viewport.width);
      }
      await expect(reactor.locator("[data-reactor-gesture]")).toHaveCSS(
        "transform",
        "none",
      );
    });
  }

  test("GIVEN rapid mixed intent WHEN transitions are interrupted THEN one world survives with zero runtime diagnostics", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.setViewportSize(VIEWPORTS[4]);
    const reactor = await openReactor(page, "motion=full&product=original");
    for (const slug of [...PRODUCT_SLUGS, ...PRODUCT_SLUGS].reverse()) {
      await reactor
        .locator(`${SELECTOR}[data-product-selector="${slug}"]`)
        .click();
    }
    await reactor.locator("[data-reactor-gesture]").focus();
    for (const key of ["ArrowRight", "ArrowLeft", "ArrowRight", "ArrowRight"]) {
      await page.keyboard.press(key);
    }
    await expectOneSelection(reactor, "extra");
    await expect.poll(() => errors, { timeout: 2_000 }).toEqual([]);
  });
});

test.describe("Flavor Reactor no-JavaScript contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium");
  test.use({ javaScriptEnabled: false });

  for (const viewport of RESILIENT_VIEWPORTS) {
    test(`GIVEN no JavaScript at ${viewport.width}x${viewport.height} WHEN the native rail is read THEN all five products remain complete`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(localizedPath("uz"), { waitUntil: "domcontentloaded" });
      const reactor = page.locator(REACTOR);
      const worlds = reactor.locator(".reactor-worlds");
      await expect(reactor.locator(".reactor-console")).toBeHidden();
      await expect(reactor.locator(".reactor-native-hint")).toBeVisible();
      await expect(reactor.locator("[data-product-card]")).toHaveCount(5);
      await expect(worlds).toHaveCSS("scroll-snap-type", /mandatory/u);
      for (const slug of PRODUCT_SLUGS) {
        const world = reactor.locator(`[data-product-card="${slug}"]`);
        await world.scrollIntoViewIfNeeded();
        await expect(world.locator("h3")).not.toBeEmpty();
        await expect(
          world.locator(".reactor-copy__description"),
        ).not.toBeEmpty();
        await expect(world.locator(".reactor-can img")).toBeVisible();
        await expect(world.locator(".reactor-actions a")).toHaveCount(2);
        await expectInlineFit(
          world.locator("h3"),
          viewport.width,
          `${slug}: title`,
        );
      }
      await expectNoHorizontalOverflow(page);
    });
  }
});
