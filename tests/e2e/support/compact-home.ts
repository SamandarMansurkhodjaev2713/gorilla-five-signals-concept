import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const GEOMETRY_TOLERANCE_PX = 1;
const MINIMUM_TOUCH_TARGET_PX = 44;
const NATIVE_SCROLL_DISTANCE_PX = 320;
const MAXIMUM_ASPECT_ERROR_RATIO = 0.005;

const TEXT_SPACING_STRESS = `
  html { font-size: 200% !important; }
  .hero h1, .hero p, .hero a {
    line-height: 1.5 !important;
    letter-spacing: .12em !important;
    word-spacing: .16em !important;
  }
  .hero p { margin-block-end: 2em !important; }
`;

interface PaintedBounds {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
}

async function paintedBounds(subject: Locator): Promise<PaintedBounds> {
  await expect(subject).toBeVisible();
  const bounds = await subject.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom + scrollY,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top + scrollY,
      width: rect.width,
    };
  });
  expect(bounds.width).toBeGreaterThan(0);
  expect(bounds.height).toBeGreaterThan(0);
  return bounds;
}

function expectInside(subject: PaintedBounds, owner: PaintedBounds): void {
  expect(subject.left).toBeGreaterThanOrEqual(
    owner.left - GEOMETRY_TOLERANCE_PX,
  );
  expect(subject.right).toBeLessThanOrEqual(
    owner.right + GEOMETRY_TOLERANCE_PX,
  );
  expect(subject.top).toBeGreaterThanOrEqual(owner.top - GEOMETRY_TOLERANCE_PX);
  expect(subject.bottom).toBeLessThanOrEqual(
    owner.bottom + GEOMETRY_TOLERANCE_PX,
  );
}

async function verifyTextLines(
  subject: Locator,
  owner: PaintedBounds,
): Promise<PaintedBounds> {
  expect((await subject.textContent())?.trim().length).toBeGreaterThan(0);
  const bounds = await paintedBounds(subject);
  const lines = await subject.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return [...range.getClientRects()].map((rect) => ({
      bottom: rect.bottom + scrollY,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top + scrollY,
      width: rect.width,
    }));
  });
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) expectInside(line, owner);
  return bounds;
}

async function verifyArtstage(page: Page): Promise<PaintedBounds> {
  const stage = await paintedBounds(page.locator(".hero-artstage"));
  const aspect = await page
    .locator(".hero-primary-can img")
    .evaluate((image) => {
      const style = getComputedStyle(image);
      return {
        rendered:
          Number.parseFloat(style.width) / Number.parseFloat(style.height),
        native:
          Number(image.getAttribute("width")) /
          Number(image.getAttribute("height")),
      };
    });
  expect(
    Math.abs(aspect.rendered / aspect.native - 1),
    "Native packshot aspect must remain undistorted",
  ).toBeLessThanOrEqual(MAXIMUM_ASPECT_ERROR_RATIO);
  expectInside(
    await paintedBounds(page.locator(".hero-primary-can img")),
    stage,
  );
  for (const selector of [".hero-heading h1", ".hero-signal-plate"]) {
    expectInside(await verifyTextLines(page.locator(selector), stage), stage);
  }
  return stage;
}

/** Actual paint, intrinsic flow and full line bounds reject hidden-content false passes. */
export async function verifyCompactHomeParity(page: Page): Promise<void> {
  const stage = await verifyArtstage(page);
  const deck = await paintedBounds(page.locator(".hero-copydeck"));
  const description = await verifyTextLines(
    page.locator(".hero-copydeck > p"),
    deck,
  );
  expect(deck.top).toBeGreaterThanOrEqual(stage.bottom - GEOMETRY_TOLERANCE_PX);
  const actions = page.locator(".hero-actions > a");
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) {
    const bounds = await paintedBounds(action);
    expectInside(bounds, deck);
    expect(bounds.top).toBeGreaterThanOrEqual(
      description.bottom - GEOMETRY_TOLERANCE_PX,
    );
    expect(bounds.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET_PX);
    expect(bounds.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET_PX);
  }
}

/** Native input must succeed before any programmatic reset can conceal a scroll lock. */
export async function verifyNoJsScrollFallback(page: Page): Promise<void> {
  await expect(page.locator(".responsible-entry")).toBeHidden();
  await expect(page.locator(".responsible-fallback")).toBeVisible();
  const viewport = page.viewportSize();
  if (viewport === null)
    throw new Error("Native scroll proof requires a viewport.");
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  const beforeWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, NATIVE_SCROLL_DISTANCE_PX);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(beforeWheel);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

/** Synchronous fixture styling works without page JavaScript; computed values prove stress is real. */
export async function applyCompactTextStress(page: Page): Promise<void> {
  await page.evaluate((content) => {
    const style = document.createElement("style");
    style.textContent = content;
    document.head.append(style);
  }, TEXT_SPACING_STRESS);
  const stress = await page
    .locator(".hero-copydeck > p")
    .evaluate((element) => ({
      rootSize: getComputedStyle(document.documentElement).fontSize,
      letterSpacing: getComputedStyle(element).letterSpacing,
      lineHeight: getComputedStyle(element).lineHeight,
    }));
  expect(stress).toEqual({
    rootSize: "32px",
    letterSpacing: "3.84px",
    lineHeight: "48px",
  });
}

/** Preserve console/CSP and uncaught page errors without suppressing application diagnostics. */
export function observeCompactRuntimeErrors(page: Page): readonly string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}
