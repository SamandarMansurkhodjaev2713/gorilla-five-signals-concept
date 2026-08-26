import { expect, test } from "@playwright/test";

import {
  acceptResponsibleEntry,
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
} from "./support/site";

const IDLE_OBSERVATION_TIMEOUT_MS = 2_000;
const MOTION_RUNTIME_READY_TIMEOUT_MS = 15_000;

test.describe("responsible product journey", () => {
  test("GIVEN a new session WHEN the homepage opens THEN the adult-context entry confirms once and restores focus", async ({
    page,
  }) => {
    const motionEngineRequests: string[] = [];
    page.on("request", (request): void => {
      if (/\/(?:gsap|ScrollTrigger)\.[^/]+\.js$/u.test(request.url())) {
        motionEngineRequests.push(request.url());
      }
    });
    await page.goto("/uz/");
    const dialog = page.locator("[data-responsible-entry]");
    const explorer = page.locator("[data-product-explorer]");
    await expect(dialog).toBeVisible();
    await expect(explorer).not.toHaveAttribute("data-enhanced", "true");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-motion-tier",
      /.+/u,
    );
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-motion-runtime-state",
      /.+/u,
    );
    await page.evaluate(
      (timeoutMs) =>
        new Promise<void>((resolve) => {
          if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(() => resolve(), { timeout: timeoutMs });
            return;
          }
          window.requestAnimationFrame(() => resolve());
        }),
      IDLE_OBSERVATION_TIMEOUT_MS,
    );
    expect(motionEngineRequests).toEqual([]);
    await expect(
      dialog.getByRole("button", { name: "18 yoshga" }),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "Saytdan chiqish" }),
    ).toHaveAttribute("href", "https://www.google.com/");

    await acceptResponsibleEntry(page);
    await expect(dialog).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      /^(?:full|lite|reduced)$/u,
      { timeout: MOTION_RUNTIME_READY_TIMEOUT_MS },
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-runtime-state",
      "ready",
      { timeout: MOTION_RUNTIME_READY_TIMEOUT_MS },
    );
    await expect(explorer).toHaveAttribute("data-enhanced", "true");
    await expect.poll(() => motionEngineRequests.length).toBeGreaterThan(0);
    await expect(page.locator("[data-responsible-marker]")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gorilla-responsible-entry-confirmed"),
        ),
      )
      .toBe("true");

    await page.reload();
    await expect(dialog).toBeHidden();
    await expect(page.locator("[data-responsible-marker]")).toBeVisible();
  });

  test("GIVEN a shareable product URL WHEN selection changes THEN state, history, motion hook, and compare tray stay synchronized", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/uz/?product=zero");
    await acceptResponsibleEntry(page);
    const explorer = page.locator("[data-product-explorer]");

    await expect(explorer).toHaveAttribute("data-selected-product", "zero");
    await expect(
      explorer.locator('[data-product-selector="zero"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      explorer.locator('[data-product-card="zero"]'),
    ).toHaveAttribute("data-motion-selected", "");
    await expect(explorer.locator("[data-product-card]:visible")).toHaveCount(
      1,
    );

    await explorer.locator("[data-product-next]").click();
    await expect(page).toHaveURL(/product=extra/u);
    await expect(explorer).toHaveAttribute("data-selected-product", "extra");
    await expect(explorer.locator("[data-comparison-tray]")).toBeVisible();
    await expect(explorer.locator("[data-comparison-name]")).toHaveText(
      "EXTRA",
    );
    await expect(explorer.locator("[data-comparison-link]")).toHaveAttribute(
      "href",
      /\/uz\/compare\/\?products=extra$/u,
    );
    await expectNoHorizontalOverflow(page);

    await page.goBack();
    await expect(explorer).toHaveAttribute("data-selected-product", "zero");

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(explorer.locator("[data-product-card]:visible")).toHaveCount(
      1,
    );
  });

  test("GIVEN the compact Flavor Reactor WHEN touch and keyboard alternatives are used THEN exactly one frequency stays active", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/uz/?product=original");
    await acceptResponsibleEntry(page);
    const explorer = page.locator("[data-product-explorer]");
    const stage = explorer.locator("[data-reactor-gesture]");

    await stage.focus();
    await page.keyboard.press("ArrowRight");
    await expect(explorer).toHaveAttribute("data-selected-product", "zero");
    await expect(explorer.locator("[data-reactor-current]")).toHaveText("02");

    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    if (box !== null) {
      await page.mouse.move(box.x + box.width * 0.78, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
      await page.mouse.up();
    }

    await expect(explorer).toHaveAttribute("data-selected-product", "extra");
    await expect(explorer.locator("[data-product-card]:visible")).toHaveCount(
      1,
    );
    await expectNoHorizontalOverflow(page);
  });

  test("GIVEN a product-specific locator URL WHEN the handoff renders THEN it preserves intent without inventing stores", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await page.goto("/uz/find/?product=mango-coconut");
    const locator = page.locator("[data-locator-handoff]");
    const product = locator.locator("[data-locator-product]");

    await expect(product).toHaveValue("mango-coconut");
    await expect(locator.locator("[data-locator-status]")).toContainText(
      "Mango–Kokos",
    );
    await expect(locator.locator("[data-locator-google]")).toHaveAttribute(
      "href",
      /Mango%E2%80%93Kokos%20Tashkent/u,
    );
    await expect(locator.locator("[data-locator-yandex]")).toHaveAttribute(
      "href",
      /^https:\/\/yandex\.uz\//u,
    );
    await expect(locator.locator(".search-context")).toContainText(
      "do‘kon manzili emas",
    );
    await expect(locator).toHaveAttribute("data-flavor", "mango-coconut");
    await expect(locator).toHaveAttribute("data-locator-selection", "product");
    await expect(locator.locator("[data-motion-find-marker]")).toHaveCount(1);
    await expect(
      locator.locator("[data-locator-product-visual]:not([hidden])"),
    ).toHaveCount(1);
    await expect(
      locator.locator("[data-locator-signal][data-active]"),
    ).toHaveCount(1);

    for (const slug of [
      "original",
      "zero",
      "extra",
      "mango-coconut",
      "lychee-pear",
    ]) {
      await product.selectOption(slug);
    }
    await expect(page).toHaveURL(/product=lychee-pear/u);
    await expect(locator).toHaveAttribute("data-flavor", "lychee-pear");
    await expect(
      locator.locator("[data-locator-product-visual]:not([hidden])"),
    ).toHaveAttribute("data-locator-product-visual", "lychee-pear");
    await page.goBack();
    await expect(product).toHaveValue("mango-coconut");
    await expect(locator).toHaveAttribute("data-flavor", "mango-coconut");
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  for (const viewport of [
    { height: 1024, width: 768 },
    { height: 768, width: 1024 },
  ]) {
    test(`GIVEN the ${String(viewport.width)}px boundary WHEN editorial type renders THEN approved columns do not clip or overlap`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/uz?motion=static");
      await acceptResponsibleEntry(page);
      const violations = await page
        .locator(
          ".manifesto li, [data-product-card] .product-copy, .compare-rail article",
        )
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const style = getComputedStyle(element);
              return (
                style.display !== "none" &&
                element.scrollWidth > element.clientWidth + 1
              );
            })
            .map((element) => ({
              clientWidth: element.clientWidth,
              sample: element.textContent?.trim().slice(0, 80),
              scrollWidth: element.scrollWidth,
            })),
        );

      expect(violations).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }
});
