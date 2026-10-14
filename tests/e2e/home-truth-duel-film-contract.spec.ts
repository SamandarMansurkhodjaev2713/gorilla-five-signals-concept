import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  collectRuntimeErrors,
  expectNoHorizontalOverflow,
  localizedPath,
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
const NO_JAVASCRIPT_VIEWPORTS = [VIEWPORTS[1], VIEWPORTS[4]] as const;
const VIDEO_REQUEST_PATTERN =
  /material-film-(?:mobile|desktop)\.(?:mp4|webm)$/u;
const TRUTH_DUEL = ".home-truth-duel";
const TRUTH = ".home-truth";
const DUEL = ".home-duel";
const FILM = ".home-material-film";
const MEDIA = "video[data-motion-media]";
const MEDIA_CONTROLS = "[data-motion-media-controls]";
const PLAY = "[data-motion-media-play]";
const PAUSE = "[data-motion-media-pause]";
const MINIMUM_TARGET_SIZE_PX = 44;
const GEOMETRY_TOLERANCE_PX = 1;
const FONT_METRIC_TOLERANCE_PX = 3;
const RETRY_OBSERVATION_MS = 300;
const REMOUNT_CYCLES = 3;

interface Rectangle {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

type MotionPreference = "full" | "lite" | "reduced";
type MaterialPreference = "autoplay" | "paused";

async function openHome(
  page: Page,
  options: {
    readonly materialPreference?: MaterialPreference;
    readonly motion: MotionPreference;
  },
): Promise<void> {
  await page.addInitScript((settings) => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", settings.motion);
    if (settings.materialPreference === undefined) {
      localStorage.removeItem("gorilla:material-film-preference:v1");
    } else {
      localStorage.setItem(
        "gorilla:material-film-preference:v1",
        settings.materialPreference,
      );
    }
  }, options);
  const response = await page.goto(localizedPath("uz"), {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok()).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    options.motion,
  );
}

function collectVideoRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on("request", (request): void => {
    if (VIDEO_REQUEST_PATTERN.test(request.url())) requests.push(request.url());
  });
  return requests;
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

async function expectInside(
  inner: Locator,
  outer: Locator,
  label: string,
): Promise<void> {
  const [innerRectangle, outerRectangle] = await Promise.all([
    requiredRectangle(inner),
    requiredRectangle(outer),
  ]);
  expect(innerRectangle.x, `${label}: left`).toBeGreaterThanOrEqual(
    outerRectangle.x - GEOMETRY_TOLERANCE_PX,
  );
  expect(innerRectangle.y, `${label}: top`).toBeGreaterThanOrEqual(
    outerRectangle.y - GEOMETRY_TOLERANCE_PX,
  );
  expect(
    innerRectangle.x + innerRectangle.width,
    `${label}: right`,
  ).toBeLessThanOrEqual(
    outerRectangle.x + outerRectangle.width + GEOMETRY_TOLERANCE_PX,
  );
  expect(
    innerRectangle.y + innerRectangle.height,
    `${label}: bottom`,
  ).toBeLessThanOrEqual(
    outerRectangle.y + outerRectangle.height + GEOMETRY_TOLERANCE_PX,
  );
}

async function expectReadable(locator: Locator, label: string): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).not.toBeEmpty();
  const metrics = await locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(metrics.scrollWidth, `${label}: inline clipping`).toBeLessThanOrEqual(
    metrics.clientWidth + FONT_METRIC_TOLERANCE_PX,
  );
}

async function expectMinimumTarget(
  locator: Locator,
  label: string,
): Promise<void> {
  const rectangle = await requiredRectangle(locator);
  expect(rectangle.width, `${label}: width`).toBeGreaterThanOrEqual(
    MINIMUM_TARGET_SIZE_PX,
  );
  expect(rectangle.height, `${label}: height`).toBeGreaterThanOrEqual(
    MINIMUM_TARGET_SIZE_PX,
  );
}

async function expectSectionTopology(page: Page): Promise<void> {
  const topology = await page.evaluate(
    ({ duelSelector, filmSelector, truthDuelSelector, truthSelector }) => {
      const required = (selector: string): HTMLElement => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        return element;
      };
      const truthDuel = required(truthDuelSelector);
      const truth = required(truthSelector);
      const duel = required(duelSelector);
      const film = required(filmSelector);
      const rectangle = (element: HTMLElement) => {
        const value = element.getBoundingClientRect();
        return {
          bottom: value.bottom,
          left: value.left,
          right: value.right,
          top: value.top,
        };
      };
      return {
        documentOrder:
          (truth.compareDocumentPosition(duel) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
            0 &&
          (duel.compareDocumentPosition(film) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
            0,
        duel: rectangle(duel),
        film: rectangle(film),
        truth: rectangle(truth),
        truthDuel: rectangle(truthDuel),
      };
    },
    {
      duelSelector: DUEL,
      filmSelector: FILM,
      truthDuelSelector: TRUTH_DUEL,
      truthSelector: TRUTH,
    },
  );
  expect(topology.documentOrder).toBe(true);
  expect(
    Math.abs(topology.film.top - topology.truthDuel.bottom),
  ).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
  expect(
    Math.abs(topology.duel.top - topology.truth.bottom),
  ).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
}

async function expectTruthContract(page: Page): Promise<void> {
  const truth = page.locator(TRUTH);
  await truth.scrollIntoViewIfNeeded();
  const facts = truth.locator(".home-truth__register li");
  await expect(facts).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expectReadable(
      facts.nth(index).locator("strong"),
      `truth fact ${index + 1}`,
    );
  }
  const warning = truth.locator(".warning-panel");
  await expect(warning).toHaveAttribute("aria-label", /\S+/u);
  await expectReadable(warning.locator(".type-label"), "warning label");
  await expectReadable(warning.locator(".type-legal"), "warning copy");
  await expectMinimumTarget(
    truth.locator(".home-truth__heading .control"),
    "product information action",
  );
}

async function expectDuelContract(page: Page): Promise<void> {
  const duel = page.locator(DUEL);
  await duel.scrollIntoViewIfNeeded();
  const arena = duel.locator(".home-duel__arena");
  const leftCan = duel.locator(".home-duel__product--left img");
  const rightCan = duel.locator(".home-duel__product--right img");
  const beam = duel.locator(".home-duel__beam");
  const action = duel.locator(".home-duel__action");
  await expect(arena).toHaveAttribute("href", /\/uz\/compare\/$/u);
  await expect(arena).toHaveAttribute("aria-label", /\S.+\S/u);
  for (const can of [leftCan, rightCan]) {
    await expect
      .poll(() =>
        can.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expectInside(can, arena, "duel can");
  }
  await expectInside(beam, arena, "duel beam");
  await expectInside(action, arena, "duel action");
  const [left, right, beamRectangle] = await Promise.all([
    requiredRectangle(leftCan),
    requiredRectangle(rightCan),
    requiredRectangle(beam),
  ]);
  const beamCenter = beamRectangle.x + beamRectangle.width / 2;
  expect(left.x + left.width / 2).toBeLessThan(beamCenter);
  expect(right.x + right.width / 2).toBeGreaterThan(beamCenter);
  await expectMinimumTarget(arena, "signal duel action");
}

async function expectPosterBaseline(scene: Locator): Promise<void> {
  const poster = scene.locator("[data-motion-media-poster]");
  const image = poster.locator("img");
  await expect(poster).toBeVisible();
  await expect(image).toHaveAttribute("alt", /\S.+\S/u);
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(scene.locator(MEDIA)).toBeHidden();
  await expect(scene.locator(`${MEDIA} source[src]`)).toHaveCount(0);
  await expect(
    scene.locator(`${MEDIA} source[data-motion-source]`),
  ).toHaveCount(4);
}

async function expectReleasedMedia(scene: Locator): Promise<void> {
  await expect(scene.locator(MEDIA)).toBeHidden();
  await expect(scene.locator(`${MEDIA} source[src]`)).toHaveCount(0);
  await expect(
    scene.locator(`${MEDIA} source[data-motion-source]`),
  ).toHaveCount(4);
}

async function expectDeferredMediaBaseline(scene: Locator): Promise<void> {
  const posterImage = scene.locator("[data-motion-media-poster] img");
  await expect(posterImage).toHaveAttribute("alt", /\S.+\S/u);
  await expect(posterImage).toHaveAttribute("src", /\S+/u);
  await expectReleasedMedia(scene);
}

test.describe("Product Truth, Signal Duel and Material Film contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const viewport of VIEWPORTS) {
    test(`GIVEN ${viewport.width}x${viewport.height} ${viewport.name} WHEN the three acts render THEN boundaries, content and primary geometry remain valid`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const videoRequests = collectVideoRequests(page);
      await openHome(page, { motion: "lite" });
      await expectSectionTopology(page);
      await expectTruthContract(page);
      await expectDuelContract(page);
      const film = page.locator(FILM);
      await film.scrollIntoViewIfNeeded();
      const filmTitle = film.locator(".home-material-film__copy h2");
      await expectReadable(filmTitle, "film title");
      await expectInside(filmTitle, film, "film title");
      await expectPosterBaseline(film);
      await expect(film.locator(MEDIA_CONTROLS)).toBeVisible();
      await expectMinimumTarget(film.locator(PLAY), "film play action");
      expect(videoRequests).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("GIVEN Reduced motion WHEN the film enters view THEN the poster remains readable without media networking", async ({
    page,
  }) => {
    const videoRequests = collectVideoRequests(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openHome(page, { motion: "reduced" });
    const film = page.locator(FILM);
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute("data-media-state", "poster");
    await expectPosterBaseline(film);
    await expect(film.locator(MEDIA_CONTROLS)).toBeHidden();
    expect(videoRequests).toEqual([]);
  });

  test("GIVEN Lite motion WHEN explicit keyboard intent starts and pauses the film THEN controls and decoder ownership stay finite", async ({
    page,
  }) => {
    const videoRequests = collectVideoRequests(page);
    await openHome(page, { motion: "lite" });
    const film = page.locator(FILM);
    await film.scrollIntoViewIfNeeded();
    await expectPosterBaseline(film);
    expect(videoRequests).toEqual([]);
    const play = film.locator(PLAY);
    await expectMinimumTarget(play, "film play action");
    await play.focus();
    await expect(play).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(film).toHaveAttribute("data-media-state", "playing");
    await expect(film.locator(`${MEDIA} source[src]`)).toHaveCount(4);
    expect(videoRequests.length).toBeGreaterThan(0);
    const pause = film.locator(PAUSE);
    await expectMinimumTarget(pause, "film pause action");
    await pause.focus();
    await expect(pause).toBeFocused();
    await page.keyboard.press("Space");
    await expect(film).toHaveAttribute("data-media-state", "paused");
    await expectReleasedMedia(film);
  });

  test("GIVEN Full motion is eligible WHEN the film reaches proximity THEN bounded autoplay starts and hidden documents release it", async ({
    page,
  }) => {
    const videoRequests = collectVideoRequests(page);
    await openHome(page, { motion: "full" });
    const film = page.locator(FILM);
    await expectDeferredMediaBaseline(film);
    expect(videoRequests).toEqual([]);
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute(
      "data-media-state",
      /^(?:loading|playing)$/u,
    );
    await expect(film.locator(`${MEDIA} source[src]`)).toHaveCount(4);
    expect(videoRequests.length).toBeGreaterThan(0);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(film).toHaveAttribute("data-media-state", "poster");
    await expectReleasedMedia(film);
  });

  test("GIVEN Full motion with a stored pause WHEN the film reaches proximity THEN networking waits for renewed explicit intent", async ({
    page,
  }) => {
    const videoRequests = collectVideoRequests(page);
    await openHome(page, {
      materialPreference: "paused",
      motion: "full",
    });
    const film = page.locator(FILM);
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute("data-media-state", "poster");
    await expectPosterBaseline(film);
    expect(videoRequests).toEqual([]);
    await film.locator(PLAY).click();
    await expect(film).toHaveAttribute("data-media-state", "playing");
    await expect(film.locator(`${MEDIA} source[src]`)).toHaveCount(4);
    expect(videoRequests.length).toBeGreaterThan(0);
  });

  test("GIVEN a media transport failure WHEN playback is requested THEN the error is announced and automatic retries remain disabled", async ({
    page,
  }) => {
    let failedRequestCount = 0;
    await page.route(VIDEO_REQUEST_PATTERN, async (route): Promise<void> => {
      failedRequestCount += 1;
      await route.abort("failed");
    });
    await openHome(page, { motion: "lite" });
    const film = page.locator(FILM);
    await film.scrollIntoViewIfNeeded();
    await film.locator(PLAY).click();
    await expect(film).toHaveAttribute("data-media-state", "error");
    await expectReleasedMedia(film);
    const expectedError = await film.getAttribute("data-media-error-label");
    expect(expectedError).not.toBeNull();
    await expect(film.locator("[data-motion-media-status]")).toHaveText(
      expectedError ?? "",
    );
    await expect(film.locator("[data-motion-media-status]")).toHaveAttribute(
      "role",
      "status",
    );
    expect(failedRequestCount).toBeGreaterThan(0);
    const countAfterFailure = failedRequestCount;
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await film.scrollIntoViewIfNeeded();
    await page.waitForTimeout(RETRY_OBSERVATION_MS);
    expect(failedRequestCount).toBe(countAfterFailure);
  });

  test("GIVEN repeated Full and Reduced remounts WHEN media ownership changes THEN every source is released with zero diagnostics", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const errors = await collectRuntimeErrors(page);
    await openHome(page, { motion: "full" });
    const film = page.locator(FILM);
    const toggle = page.locator(".site-header > [data-motion-toggle]");
    await film.scrollIntoViewIfNeeded();
    for (let cycle = 0; cycle < REMOUNT_CYCLES; cycle += 1) {
      await expect(film).toHaveAttribute(
        "data-media-state",
        /^(?:loading|playing)$/u,
      );
      await toggle.click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expect(film).toHaveAttribute("data-motion-ready", "reduced");
      await expect(film).toHaveAttribute("data-media-state", "poster");
      await expectReleasedMedia(film);
      await expect(film.locator(MEDIA_CONTROLS)).toBeHidden();
      await toggle.click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "full",
      );
      await film.scrollIntoViewIfNeeded();
      await expect(film).toHaveAttribute("data-motion-ready", "full");
    }
    await expect.poll(() => errors, { timeout: 2_000 }).toEqual([]);
  });
});

test.describe("Product Truth, Signal Duel and Material Film no-JavaScript contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium");
  test.use({ javaScriptEnabled: false });

  for (const viewport of NO_JAVASCRIPT_VIEWPORTS) {
    test(`GIVEN no JavaScript at ${viewport.width}x${viewport.height} WHEN the acts render THEN facts, links and the approved poster remain available`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const videoRequests = collectVideoRequests(page);
      const response = await page.goto(localizedPath("uz"), {
        waitUntil: "domcontentloaded",
      });
      expect(response?.ok()).toBe(true);
      await expectSectionTopology(page);
      await expectTruthContract(page);
      const truthAction = page.locator(
        `${TRUTH} .home-truth__heading .control`,
      );
      const duelAction = page.locator(`${DUEL} .home-duel__arena`);
      await truthAction.focus();
      await expect(truthAction).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(duelAction).toBeFocused();
      const film = page.locator(FILM);
      await film.scrollIntoViewIfNeeded();
      await expectPosterBaseline(film);
      await expect(film.locator(MEDIA_CONTROLS)).toBeHidden();
      expect(videoRequests).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }
});
