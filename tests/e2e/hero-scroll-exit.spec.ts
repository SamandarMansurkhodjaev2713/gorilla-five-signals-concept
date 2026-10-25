import { expect, test } from "@playwright/test";
import {
  expectActive,
  readExit,
  readHistoryPosition,
  scrollAndPaint,
} from "./support/hero-scroll-exit";
import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";

const RESTORATION_FRAME_LIMIT = 12;
const RELOAD_STORAGE_KEY = "gorilla:reload-scroll:v1";
const ROUTE_SNAPSHOT_KEY = "gorillaScrollY";
const VIEWPORTS = [
  { width: 390, height: 844, preference: "lite" },
  { width: 844, height: 390, preference: "full" },
  { width: 1440, height: 900, preference: "full" },
] as const;

test("GIVEN pending route restoration WHEN a newer wheel intent arrives THEN the old coordinate cannot capture scrolling", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await page.goto("/uz/?motion=static");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  const finalY = await page.evaluate(async (frameLimit) => {
    history.replaceState({ gorillaScrollY: 600 }, "");
    document.dispatchEvent(new Event("astro:page-load"));
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 300 }));
    scrollTo({ top: 900, behavior: "instant" });
    const intendedY = scrollY;
    for (let frame = 0; frame < frameLimit; frame += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }
    if (intendedY <= 0)
      throw new Error("The page must have real scrolling extent.");
    return { intendedY, actualY: scrollY };
  }, RESTORATION_FRAME_LIMIT);
  expect(finalY.actualY).toBe(finalY.intendedY);
});

test("GIVEN stale menu route metadata WHEN a native reload occurs THEN the current browser coordinate wins", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "lite");
  });
  await page.goto("/uz/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await openConsumerMotionControls(page);
  await closeConsumerMotionControls(page);
  await scrollAndPaint(page, 600);
  expect(await readHistoryPosition(page, ROUTE_SNAPSHOT_KEY)).toBe(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
  expect(
    await page.evaluate(
      (key) => sessionStorage.getItem(key),
      RELOAD_STORAGE_KEY,
    ),
  ).toBeNull();
});

test("GIVEN a scrolled page with an open menu WHEN reloaded THEN the underlying position survives the menu scroll lock", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "lite");
  });
  await page.goto("/uz/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await scrollAndPaint(page, 600);
  await openConsumerMotionControls(page);
  expect(await readHistoryPosition(page, ROUTE_SNAPSHOT_KEY)).toBe(600);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
  expect(
    await page.evaluate(
      (key) => sessionStorage.getItem(key),
      RELOAD_STORAGE_KEY,
    ),
  ).toBeNull();
});

for (const viewport of VIEWPORTS) {
  test(`GIVEN ${viewport.width}x${viewport.height} ${viewport.preference} WHEN scroll exits, restores and reverses THEN native motion retains its range without applying before entry`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript((preference) => {
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
      localStorage.setItem("gorilla:motion-preference:v1", preference);
    }, viewport.preference);
    await page.goto("/uz/");
    const hero = page.locator('[data-motion-scene="hero"]');
    await expect(hero).toHaveAttribute(
      "data-motion-ready",
      viewport.preference,
    );
    await scrollAndPaint(page, 0);
    const start = await readExit(page);
    expect(start.width).toBeGreaterThan(0);
    expect(start.height).toBeGreaterThan(0);
    await expect(hero.locator("h1")).toHaveText(/\S+/u);
    await expect(hero.locator(".hero-primary-action")).toHaveAttribute(
      "href",
      /\S+/u,
    );
    if (!start.supported) {
      expect(start.count).toBe(0);
      await expect(hero.locator("[data-hero-primary-can]")).toBeVisible();
      test.info().annotations.push({
        type: "native-exit",
        description:
          "Engine uses the existing GSAP-entry/static-scroll fallback.",
      });
      return;
    }
    expect(start.count).toBe(1);
    expect(start.fill).toBe("forwards");
    expect(start.progress).toBeNull();
    const range = await hero.evaluate((element) => {
      const rectangle = element.getBoundingClientRect();
      const top = rectangle.top + scrollY;
      return {
        middle:
          top +
          Math.max(0, rectangle.height - innerHeight) +
          Math.min(rectangle.height, innerHeight) / 2,
        end: top + rectangle.height + innerHeight,
      };
    });
    await scrollAndPaint(page, range.middle);
    expectActive((await readExit(page)).progress);
    const restoredY = await page.evaluate(() => scrollY);
    await page.reload({ waitUntil: "load" });
    await expect(hero).toHaveAttribute(
      "data-motion-ready",
      viewport.preference,
    );
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(restoredY);
    expect(
      await page.evaluate(
        (key) => sessionStorage.getItem(key),
        RELOAD_STORAGE_KEY,
      ),
    ).toBeNull();
    expectActive((await readExit(page)).progress);
    await scrollAndPaint(page, range.end);
    expect((await readExit(page)).progress).toBe(1);
    await scrollAndPaint(page, 0);
    const reversed = await readExit(page);
    expect(reversed.count).toBe(1);
    expect(reversed.progress).toBeNull();
    await expect(hero.locator("[data-hero-primary-can]")).toBeVisible();
    await hero.locator(".hero-primary-action").click();
    await expect(page).toHaveURL(/\/uz\/products\/$/u);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}
