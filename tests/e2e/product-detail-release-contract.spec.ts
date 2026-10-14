import { expect, test, type Page } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  localizedPath,
  LOCALES,
  PRODUCT_SLUGS,
} from "./support/site";

const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";
const READY_TIMEOUT_MS = 15_000;
const VIEWPORTS = [
  { height: 800, width: 360 },
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 768, width: 1024 },
  { height: 900, width: 1440 },
  { height: 1080, width: 1920 },
  { height: 390, width: 844 },
] as const;

async function preparePage(page: Page, preference: string): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem(key, value);
    },
    { key: MOTION_PREFERENCE_KEY, value: preference },
  );
}

async function expectHeroFits(page: Page): Promise<void> {
  const measurements = await page
    .locator("[data-world-hero]")
    .evaluate((hero) => {
      const heroBox = hero.getBoundingClientRect();
      const targets = Array.from(
        hero.querySelectorAll<HTMLElement>(
          ".product-heading__title-line, .product-heading__description, .actions, [data-world-can-media]",
        ),
      );
      return {
        hero: { left: heroBox.left, right: heroBox.right },
        targets: targets.map((target) => {
          const box = target.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }),
      };
    });

  for (const target of measurements.targets) {
    expect(target.left).toBeGreaterThanOrEqual(measurements.hero.left - 2);
    expect(target.right).toBeLessThanOrEqual(measurements.hero.right + 2);
  }
  await expectNoHorizontalOverflow(page);
}

test.describe("product-detail release contract", () => {
  test("GIVEN every locale and viewport WHEN reduced worlds render THEN semantic content and geometry reflow without clipping", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await preparePage(page, "reduced");
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const locale of LOCALES) {
        for (const slug of PRODUCT_SLUGS) {
          await page.goto(localizedPath(locale, `/products/${slug}`), {
            waitUntil: "domcontentloaded",
          });
          await expect(page.locator("[data-product-world]")).toHaveAttribute(
            "data-product-world",
            slug,
          );
          await expect(page.locator("h1")).toBeVisible();
          await expect(
            page.locator(".actions .control--primary"),
          ).toBeVisible();
          await expectHeroFits(page);
        }
      }
    }
  });

  test("GIVEN 200 percent text and WCAG spacing WHEN localized worlds render THEN copy stays inside its hero", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await preparePage(page, "reduced");
    await page.setViewportSize({ height: 900, width: 640 });

    for (const locale of LOCALES) {
      for (const slug of PRODUCT_SLUGS) {
        await page.goto(localizedPath(locale, `/products/${slug}`), {
          waitUntil: "domcontentloaded",
        });
        await page.addStyleTag({
          content: `
            :root { font-size: 200% !important; }
            * { letter-spacing: 0.12em !important; line-height: 1.5 !important; word-spacing: 0.16em !important; }
          `,
        });
        await expectHeroFits(page);
      }
    }
  });

  test("GIVEN Full and Lite motion at 844 by 390 WHEN the hero mounts THEN readiness is hero-owned and semantic copy is never hidden", async ({
    browser,
  }) => {
    test.setTimeout(90_000);
    for (const tier of ["full", "lite"] as const) {
      const context = await browser.newContext({
        viewport: { height: 390, width: 844 },
      });
      const page = await context.newPage();
      await preparePage(page, tier);
      for (const slug of PRODUCT_SLUGS) {
        await page.goto(localizedPath("uz", `/products/${slug}`), {
          waitUntil: "domcontentloaded",
        });
        const world = page.locator("[data-product-world]");
        await expect(world).toHaveAttribute("data-motion-ready", tier, {
          timeout: READY_TIMEOUT_MS,
        });
        await expect(world).toHaveAttribute(
          "data-world-entrance-ready",
          "animated",
          {
            timeout: READY_TIMEOUT_MS,
          },
        );
        const copyStyle = await world
          .locator("[data-world-copy]")
          .evaluate((copy) => {
            const style = getComputedStyle(copy);
            return { opacity: style.opacity, visibility: style.visibility };
          });
        expect(copyStyle).toEqual({ opacity: "1", visibility: "visible" });
      }
      await context.close();
    }
  });

  test("GIVEN JavaScript is unavailable WHEN representative locale-world pairs render THEN the native packshot and complete journey remain usable", async ({
    browser,
  }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (let index = 0; index < PRODUCT_SLUGS.length; index += 1) {
        const slug = PRODUCT_SLUGS[index];
        const locale = LOCALES[index % LOCALES.length];
        if (slug === undefined || locale === undefined) {
          throw new Error("Product detail no-JS matrix is incomplete.");
        }
        await page.goto(localizedPath(locale, `/products/${slug}`), {
          waitUntil: "domcontentloaded",
        });
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator("[data-packshot-image]")).toBeVisible();
        await expect(page.locator(".actions .control--primary")).toBeVisible();
        await expectHeroFits(page);
      }
    }
    await context.close();
  });

  test("GIVEN packshot failure and repeated capability changes WHEN the world recovers THEN fallback and cleanup remain deterministic", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await preparePage(page, "full");
    await page.route("**/media/generated/products/can-*.webp", (route) =>
      route.abort(),
    );
    await page.goto(localizedPath("ru", "/products/original"), {
      waitUntil: "domcontentloaded",
    });
    const packshot = page.locator("product-packshot");
    await expect(packshot).toHaveAttribute("data-media-state", "failed");
    await expect(
      packshot.locator("> .product-packshot__fallback"),
    ).toBeVisible();
    await expect(packshot.locator(".product-packshot__picture")).toBeHidden();

    const world = page.locator("[data-product-world]");
    const motionConsole = page.locator(".motion-console");
    await motionConsole.locator("summary").click();
    for (let cycle = 0; cycle < 20; cycle += 1) {
      const tier = cycle % 2 === 0 ? "reduced" : "lite";
      await motionConsole.locator(`[data-motion-preference="${tier}"]`).click();
      await expect(world).toHaveAttribute("data-motion-ready", tier, {
        timeout: READY_TIMEOUT_MS,
      });
      if (tier === "reduced") {
        await expect(world).not.toHaveAttribute("data-motion-path", /.+/u);
      }
    }
    await motionConsole.locator('[data-motion-preference="reduced"]').click();
    await expect(world).toHaveAttribute("data-motion-ready", "reduced", {
      timeout: READY_TIMEOUT_MS,
    });
    const inlineResidue = await world
      .locator("[data-world-copy], [data-world-art], [data-world-can-media]")
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const style = element.getAttribute("style");
          return style === null
            ? []
            : [{ className: element.getAttribute("class"), style }];
        }),
      );
    expect(inlineResidue).toEqual([]);
  });
});
