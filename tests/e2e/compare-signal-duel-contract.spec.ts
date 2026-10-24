import process from "node:process";

import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";

import { expectPaintedTargets } from "./support/painted-targets";
import {
  acceptResponsibleEntry,
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const VIEWPORTS = [
  { name: "compact-320", width: 320, height: 720 },
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "landscape-844", width: 844, height: 390 },
  { name: "landscape-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
] as const;

const ROOT = "[data-compare-root]";
const SELECTED = "[data-compare-product]:not([hidden])";
const SELECTED_PRODUCTS = ["original", "zero", "extra"] as const;
const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "translate",
  "visibility",
] as const;

async function openDuel(page: Page, suffix: string): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "full");
  });
  await expectSemanticPage(page, "uz", suffix);
  await acceptResponsibleEntry(page);
  await expect(page.locator(ROOT)).toHaveAttribute(
    "data-compare-enhanced",
    "true",
  );
}

function intersects(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function expectPresentationReleased(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.locator(ROOT).evaluate((root, properties) => {
        return Array.from(
          root.querySelectorAll<HTMLElement>(
            "[data-motion-product], .signal-channel__copy > *",
          ),
        ).every((element) =>
          properties.every(
            (property) => element.style.getPropertyValue(property) === "",
          ),
        );
      }, PRESENTATION_PROPERTIES),
    )
    .toBe(true);
}

async function expectArenaTextNotToOverlap(page: Page): Promise<void> {
  await expectArenaTextFamilies(page);
  const overlaps = await page
    .locator(".selected-products")
    .evaluate((arena) => {
      const selectors = [
        ".selected-products__versus",
        "[data-compare-product]:not([hidden]) .signal-channel__topline > span",
      ];
      const elements = selectors.flatMap((selector) =>
        Array.from(arena.querySelectorAll<HTMLElement>(selector)),
      );
      const visible = elements.filter((element) => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          bounds.width > 0 &&
          bounds.height > 0
        );
      });

      return visible.flatMap((first, index) => {
        const firstBounds = first.getBoundingClientRect();
        return visible.slice(index + 1).flatMap((second) => {
          const secondBounds = second.getBoundingClientRect();
          const doesIntersect = !(
            firstBounds.right <= secondBounds.left ||
            secondBounds.right <= firstBounds.left ||
            firstBounds.bottom <= secondBounds.top ||
            secondBounds.bottom <= firstBounds.top
          );
          return doesIntersect
            ? [
                `${first.textContent?.trim() ?? ""} <> ${second.textContent?.trim() ?? ""}`,
              ]
            : [];
        });
      });
    });
  expect(overlaps).toEqual([]);
}

async function expectArenaTextFamilies(page: Page): Promise<void> {
  const selected = page.locator(SELECTED);
  await expect(selected).toHaveCount(SELECTED_PRODUCTS.length);
  await expect(
    page.locator(".selected-products__frequency, .signal-channel__meter"),
  ).toHaveCount(0);
  await expect(page.locator(".empty-state .type-data")).toHaveCount(0);
  for (const card of await selected.all()) {
    await expectChannelText(card);
  }
  await expect(page.locator(".selected-products__versus")).toHaveCount(1);
  await expect(page.locator(".selected-products__versus")).toBeHidden();
}

async function expectChannelText(card: Locator): Promise<void> {
  await expect(card.locator(".signal-channel__topline > span")).toHaveCount(1);
  await expect(card.locator(".signal-channel__topline .type-data")).toHaveCount(
    0,
  );
  const name = card.locator(".signal-channel__topline .type-label");
  await expect(name).toHaveCount(1);
  const productName = await card
    .locator(".signal-channel__copy h2")
    .textContent();
  if (productName === null || productName.trim() === "") {
    throw new Error("Selected products must expose their canonical name.");
  }
  await expect(name).toHaveText(productName);
  await expectPaintedTargets(name, 1);
  await expectPaintedTargets(card.locator(".signal-channel__notes"), 1);
  await expectPaintedTargets(card.locator(".signal-channel__description"), 1);
  await expect(card.locator(".signal-channel__copy .type-label")).toHaveText(
    "Ta’m",
  );
}

for (const viewport of VIEWPORTS) {
  test(`GIVEN ${viewport.name} WHEN Signal Duel renders THEN its single arena remains bounded and usable`, async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.setViewportSize(viewport);
    await openDuel(page, `/compare/?products=${SELECTED_PRODUCTS.join(",")}`);

    const expectedCount = SELECTED_PRODUCTS.length;
    const arena = page.locator(".selected-products");
    const visuals = page.locator(`${SELECTED} .signal-channel__visual`);
    await expect(page.locator(".selected-products__field")).toHaveCount(1);
    await expect(page.locator(SELECTED)).toHaveCount(expectedCount);
    await expect(visuals).toHaveCount(expectedCount);
    await expectNoHorizontalOverflow(page);
    await arena.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    const images = page.locator(`${SELECTED} img`);
    await expectPaintedTargets(images, expectedCount);
    for (const card of await page.locator(SELECTED).all()) {
      await expect(card.locator("img")).toHaveCount(1);
    }
    for (const image of await images.all()) {
      await image.evaluate((element) =>
        element.scrollIntoView({ block: "center" }),
      );
      await expect(image).toBeInViewport();
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              element instanceof HTMLImageElement &&
              element.complete &&
              element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await expectPresentationReleased(page);
    await expectArenaTextNotToOverlap(page);

    const positions = await page
      .locator(SELECTED)
      .evaluateAll((elements) =>
        elements.map((element) =>
          element.getAttribute("data-compare-position"),
        ),
      );
    expect(positions).toEqual(
      Array.from({ length: expectedCount }, (_, index) => String(index)),
    );

    const arenaBox = await arena.boundingBox();
    if (arenaBox === null) {
      throw new Error(`Signal Duel arena has no box at ${viewport.name}.`);
    }
    for (const visual of await visuals.all()) {
      const visualBox = await visual.boundingBox();
      if (visualBox === null) {
        throw new Error(`A selected visual has no box at ${viewport.name}.`);
      }
      expect(intersects(arenaBox, visualBox)).toBe(true);
    }

    const undersized = await page
      .locator(`${ROOT} :is(select, button, a):visible`)
      .evaluateAll(
        (elements) =>
          elements.filter((element) => {
            const box = element.getBoundingClientRect();
            return box.width < 44 || box.height < 44;
          }).length,
      );
    expect(undersized).toBe(0);
    expect(errors).toEqual([]);

    if (process.env.CAPTURE_COMPARE === "true") {
      const pauseControl = await openConsumerMotionControls(page);
      await pauseControl.click();
      await closeConsumerMotionControls(page);
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expectPresentationReleased(page);
      await page.addStyleTag({
        content: ".site-header, .skip-link { visibility: hidden !important; }",
      });
      await arena.screenshot({
        animations: "disabled",
        path: `.tmp/compare-signal-duel/${viewport.name}.png`,
      });
    }
  });
}

test("GIVEN Full motion WHEN selection locks THEN the causal field cue settles into an unchanged static rest state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_440, height: 900 });
  await openDuel(page, "/compare/?products=original,zero,extra");

  await page
    .locator("[data-compare-slot]")
    .nth(1)
    .selectOption("mango-coconut");
  await expect(page.locator("[data-compare-field]")).toHaveAttribute(
    "data-field-cue",
    "active",
  );
  await expect(page.locator("[data-compare-field]")).not.toHaveAttribute(
    "data-field-cue",
    "active",
    { timeout: 1_200 },
  );

  const readRestState = (): Promise<readonly string[]> =>
    page.locator("[data-compare-field]").evaluate((field) =>
      [
        ".selected-products__pulse",
        ".selected-products__orbit--outer",
        ".selected-products__orbit--inner",
      ].flatMap((selector) => {
        const element = field.querySelector<HTMLElement>(selector);
        if (element === null) {
          return [];
        }
        const style = getComputedStyle(element);
        return [style.animationName, style.opacity, style.transform];
      }),
    );
  const firstRestState = await readRestState();
  await page.waitForTimeout(1_000);
  expect(await readRestState()).toEqual(firstRestState);

  const fieldAnimationState = await page
    .locator("[data-compare-field]")
    .evaluate((field) => {
      const animations = field.getAnimations({ subtree: true });
      return {
        infinite: animations.filter(
          (animation) => animation.effect?.getTiming().iterations === Infinity,
        ).length,
        running: animations.filter(
          (animation) => animation.playState === "running",
        ).length,
      };
    });
  expect(fieldAnimationState).toEqual({ infinite: 0, running: 0 });
});

test("GIVEN rapid selection and motion-mode intents WHEN the tier leaves Full THEN no field cue residue survives", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1_440, height: 900 });
  await openDuel(page, "/compare/?products=original,zero,extra");

  await page
    .locator("[data-compare-slot]")
    .nth(1)
    .selectOption("mango-coconut");
  await page.locator("[data-compare-slot]").nth(1).selectOption("lychee-pear");
  const motionConsole = page.locator(".motion-console");
  await motionConsole.locator("summary").click();
  await motionConsole.locator('[data-motion-preference="lite"]').click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "lite",
  );
  await expect(page.locator("[data-compare-field]")).not.toHaveAttribute(
    "data-field-cue",
    "active",
  );

  await motionConsole.locator('[data-motion-preference="full"]').click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "full",
  );
  await page.locator("[data-compare-slot]").nth(1).selectOption("extra");
  await motionConsole.locator('[data-motion-preference="reduced"]').click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "reduced",
  );
  await expect(page.locator("[data-compare-field]")).not.toHaveAttribute(
    "data-field-cue",
    "active",
  );
  await expect
    .poll(() =>
      page
        .locator("[data-compare-field]")
        .evaluate(
          (field) =>
            field
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === "running").length,
        ),
    )
    .toBe(0);
});

for (const preference of ["reduced", "lite"] as const) {
  test(`GIVEN explicit ${preference} preference WHEN the duel opens THEN motion tier and content remain truthful`, async ({
    page,
  }) => {
    await page.addInitScript((value) => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem("gorilla:motion-preference:v1", value);
    }, preference);
    await expectSemanticPage(page, "en", "/compare/?products=original,extra");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      preference,
    );
    await expect(page.locator(SELECTED)).toHaveCount(2);
    await expect(
      page.locator(`${SELECTED} .signal-channel__description`),
    ).toHaveCount(2);
    await expect(
      page.locator(`${SELECTED} .signal-channel__description`).first(),
    ).toContainText(/\S/u);
    await expect(page.locator(`${SELECTED} dd`)).toHaveCount(0);
    await expect(page.locator(".verification-note")).toHaveCount(0);
    await page
      .locator("[data-compare-slot]")
      .nth(1)
      .selectOption("mango-coconut");
    await expect(page.locator("[data-compare-field]")).not.toHaveAttribute(
      "data-field-cue",
      "active",
    );
    await expect
      .poll(() =>
        page
          .locator("[data-compare-field]")
          .evaluate(
            (field) =>
              field
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === "running")
                .length,
          ),
      )
      .toBe(0);
  });
}

test("GIVEN all supported locales WHEN Signal Duel opens THEN the authored lead and native selector stay localized", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const expectations = {
    en: {
      title: "Five signals.",
      legend: "Choose products to compare",
      slots: ["Product 1", "Product 2", "Product 3"],
      rows: ["Flavor", "Description", "Open product"],
      empty: "Choose products to compare.",
    },
    ru: {
      title: "Пять сигналов.",
      legend: "Выберите продукты для сравнения",
      slots: ["Продукт 1", "Продукт 2", "Продукт 3"],
      rows: ["Вкус", "Описание", "Открыть продукт"],
      empty: "Выберите продукты для сравнения.",
    },
    uz: {
      title: "Beshta signal.",
      legend: "Taqqoslash uchun mahsulotlarni tanlang",
      slots: ["Mahsulot 1", "Mahsulot 2", "Mahsulot 3"],
      rows: ["Ta’m", "Tavsif", "Mahsulotni ochish"],
      empty: "Taqqoslash uchun mahsulotlarni tanlang.",
    },
  } as const;

  for (const locale of ["en", "ru", "uz"] as const) {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
    await expectSemanticPage(page, locale, "/compare/");
    await expect(page.locator(".duel-lead h1")).toContainText(
      expectations[locale].title,
    );
    await expect(page.locator(".selector-panel legend")).toHaveText(
      expectations[locale].legend,
    );
    await expect(page.locator(".slot-grid__label")).toHaveText(
      expectations[locale].slots,
    );
    await expect(page.locator(".slot-grid__label .type-data")).toHaveCount(0);
    await expectPaintedTargets(
      page.locator(".slot-grid label:not([hidden]) .slot-grid__label"),
      expectations[locale].slots.length,
    );
    await expect(page.locator("[data-compare-fallback] tbody th")).toHaveText(
      expectations[locale].rows,
    );
    await expect(page.locator("[data-compare-empty]")).toHaveText(
      expectations[locale].empty,
    );
    await expect(
      page.locator(".selected-products__frequency, .signal-channel__meter"),
    ).toHaveCount(0);
  }
});

test.describe("no-JavaScript Signal Duel", () => {
  test.use({ javaScriptEnabled: false });

  test("GIVEN scripts are unavailable WHEN compare renders THEN all five products retain real descriptions and native product actions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expectSemanticPage(page, "uz", "/compare/");
    await expect(page.locator("[data-compare-enhanced]")).toBeHidden();
    await expect(page.locator("[data-compare-fallback] tbody tr")).toHaveCount(
      3,
    );
    const table = page.locator("[data-compare-fallback]");
    await expect(table.locator("thead [data-product-slug]")).toHaveCount(5);
    await expect(table.locator("tbody th")).toHaveText([
      "Ta’m",
      "Tavsif",
      "Mahsulotni ochish",
    ]);
    await expect(table.locator("tbody td")).toHaveCount(15);
    for (const cell of await table.locator("tbody td").all()) {
      await expect(cell).toContainText(/\S/u);
    }
    const links = table.locator("tbody a[href]");
    await expect(links).toHaveCount(5);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute(
        "href",
        /^\/uz\/products\/[a-z-]+\/$/u,
      );
    }
    await expect(table).not.toContainText("Hali tasdiqlanmagan");
  });
});
