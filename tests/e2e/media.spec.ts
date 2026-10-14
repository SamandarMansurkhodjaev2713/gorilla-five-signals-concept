import { platform } from "node:os";

import { expect, test } from "@playwright/test";

import { expectSemanticPage } from "./support/site";

const VIDEO_REQUEST_PATTERN = /material-film-(?:mobile|desktop)\.(?:mp4|webm)$/;
const MEDIA_SCENE_SELECTOR = "[data-motion-scene='material-film']";
const MEDIA_SELECTOR = "video[data-motion-media]";

test.describe("bounded product film", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
  });

  test("GIVEN the film is outside proximity WHEN the homepage loads THEN no video asset is requested", async ({
    page,
  }) => {
    const videoRequests: string[] = [];
    page.on("request", (request): void => {
      if (VIDEO_REQUEST_PATTERN.test(request.url())) {
        videoRequests.push(request.url());
      }
    });

    await expectSemanticPage(page, "uz");

    const media = page.locator(MEDIA_SELECTOR);
    await expect(media.locator("source[src]")).toHaveCount(0);
    await expect(media.locator("source[data-motion-source]")).toHaveCount(4);
    expect(videoRequests).toEqual([]);
  });

  test("GIVEN Full motion WHEN the film ends THEN playback returns to a finite poster state", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "full"),
    );
    await expectSemanticPage(page, "uz");

    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    const media = scene.locator(MEDIA_SELECTOR);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute(
      "data-media-state",
      /^(?:loading|playing)$/,
    );
    await expect(media.locator("source[src]")).toHaveCount(4);
    await expect(media).not.toHaveAttribute("loop", "");

    await media.evaluate((element): void => {
      element.dispatchEvent(new Event("ended"));
    });

    await expect(scene).toHaveAttribute("data-media-state", "ended");
    await expect(media).toBeHidden();
    await expect(media.locator("source[src]")).toHaveCount(0);
    await expect(media.locator("source[data-motion-source]")).toHaveCount(4);
  });

  test("GIVEN Reduced motion WHEN the film enters view THEN autoplay remains disabled", async ({
    page,
  }) => {
    const videoRequests: string[] = [];
    page.on("request", (request): void => {
      if (VIDEO_REQUEST_PATTERN.test(request.url())) {
        videoRequests.push(request.url());
      }
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectSemanticPage(page, "uz");

    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    await scene.scrollIntoViewIfNeeded();

    await expect(scene).toHaveAttribute("data-media-state", "poster");
    await expect(scene.locator("[data-motion-media-controls]")).toBeHidden();
    await expect(scene.locator("source[src]")).toHaveCount(0);
    expect(videoRequests).toEqual([]);
  });

  test("GIVEN Lite motion WHEN the film enters view THEN media loads only after explicit intent and pause releases it", async ({
    page,
  }) => {
    const videoRequests: string[] = [];
    page.on("request", (request): void => {
      if (VIDEO_REQUEST_PATTERN.test(request.url())) {
        videoRequests.push(request.url());
      }
    });
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "lite"),
    );
    await expectSemanticPage(page, "uz");

    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    const media = scene.locator(MEDIA_SELECTOR);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-motion-ready", "lite");
    await expect(scene.locator("[data-motion-media-controls]")).toBeVisible();
    await expect(scene).toHaveAttribute("data-media-state", "poster");
    await expect(media.locator("source[src]")).toHaveCount(0);
    expect(videoRequests).toEqual([]);

    await scene.locator("[data-motion-media-play]").click();
    await expect(scene).toHaveAttribute("data-media-state", "playing");
    await expect(media.locator("source[src]")).toHaveCount(4);
    await scene.locator("[data-motion-media-pause]").click();
    await expect(scene).toHaveAttribute("data-media-state", "paused");
    await expect(media.locator("source[src]")).toHaveCount(0);
    await expect(media).toBeHidden();
  });

  test("GIVEN Full playback WHEN the film leaves proximity THEN sources and decoder return to poster state", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "full"),
    );
    await expectSemanticPage(page, "uz");
    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    const media = scene.locator(MEDIA_SELECTOR);

    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute(
      "data-media-state",
      /^(?:loading|playing)$/,
    );
    await expect(media.locator("source[src]")).toHaveCount(4);
    await page.evaluate(() => window.scrollTo({ top: 0 }));

    await expect(scene).toHaveAttribute("data-media-state", "poster");
    await expect(media.locator("source[src]")).toHaveCount(0);
    await expect(media).toBeHidden();
  });

  test("GIVEN an active film WHEN motion capability rebuilds THEN media sources and decoder are released", async ({
    browserName,
    page,
  }, testInfo) => {
    if (browserName === "webkit" && platform() === "win32") {
      testInfo.setTimeout(90_000);
    }
    await page.addInitScript(() =>
      localStorage.setItem("gorilla:motion-preference:v1", "full"),
    );
    await expectSemanticPage(page, "uz");

    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    const media = scene.locator(MEDIA_SELECTOR);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute(
      "data-media-state",
      /^(?:loading|playing)$/,
    );

    await page.locator("[data-motion-toggle]").first().click();

    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(scene).toHaveAttribute("data-media-state", "poster");
    await expect
      .poll(() =>
        media
          .locator("source")
          .evaluateAll((sources) =>
            sources.every(
              (source) =>
                !source.hasAttribute("src") &&
                source.hasAttribute("data-motion-source"),
            ),
          ),
      )
      .toBe(true);
  });

  test("GIVEN automatic playback fails WHEN proximity changes again THEN the controller does not retry without intent", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName === "webkit" && platform() === "win32",
      "Windows WebKit does not reliably mount this deferred scene; Linux CI owns this contract.",
    );
    let failedRequestCount = 0;
    await page.route(VIDEO_REQUEST_PATTERN, async (route): Promise<void> => {
      failedRequestCount += 1;
      await route.abort();
    });
    await page.addInitScript(() => {
      localStorage.setItem("gorilla:motion-preference:v1", "full");
      localStorage.setItem("gorilla:material-film-preference:v1", "paused");
    });
    await expectSemanticPage(page, "uz");

    const scene = page.locator(MEDIA_SCENE_SELECTOR);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-motion-ready", "full");
    const play = scene.locator("[data-motion-media-play]");
    await expect(play).toBeVisible();
    await play.evaluate((button): void => {
      if (button instanceof HTMLButtonElement) {
        button.click();
      }
    });
    await expect(scene).toHaveAttribute("data-media-state", "error");
    await expect(scene.locator("source[src]")).toHaveCount(0);
    await expect(scene.locator("source[data-motion-source]")).toHaveCount(4);
    expect(failedRequestCount).toBeGreaterThan(0);
    const countAfterFailure = failedRequestCount;

    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    expect(failedRequestCount).toBe(countAfterFailure);
  });
});
