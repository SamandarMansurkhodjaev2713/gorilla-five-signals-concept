import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  closeConsumerMotionControls,
  openConsumerMotionControls,
} from "./support/consumer-motion-controls";
import { collectRuntimeErrors, PRODUCT_SLUGS } from "./support/site";

const PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;
const OWNED_TARGETS =
  "[data-reactor-world], [data-reactor-world] :is([data-motion-product], [data-motion-copy], [data-reactor-word], [data-reactor-material], [data-reactor-orbit], [data-reactor-shard])";
const POST_CLEANUP_FRAMES = 4;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

interface ReactorOwnershipProbe {
  largestFrameGapsMs: number[];
  maximumLeaving: number;
  styleMutations: number;
  heldPaintObservations: number;
  holdViolations: string[];
}

declare global {
  interface Window {
    __reactorOwnershipSeeded?: boolean;
    __reactorOwnershipProbe?: ReactorOwnershipProbe;
    __stopReactorOwnershipProbe?: () => void;
  }
}

async function snapshot(targets: Locator) {
  return targets.evaluateAll(
    (elements, properties) =>
      elements.map((element) => {
        if (!(element instanceof HTMLElement))
          throw new Error("Reactor target is not HTML.");
        return properties.map((property) => ({
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        }));
      }),
    PROPERTIES,
  );
}

async function armAuthoredBaseline(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "reduced");
    const observer = new MutationObserver(seed);
    function stop(): void {
      observer.disconnect();
      window.removeEventListener("pagehide", stop);
    }
    function seed(): void {
      const product = document.querySelector(
        '[data-reactor-world][data-flavor="original"] [data-motion-product]',
      );
      if (!(product instanceof HTMLElement)) return;
      product.style.setProperty("opacity", "0.83", "important");
      window.__reactorOwnershipSeeded = true;
      stop();
    }
    observer.observe(document, { childList: true, subtree: true });
    window.addEventListener("pagehide", stop, { once: true });
    seed();
  });
}

async function observeOwnership(reactor: Locator): Promise<void> {
  await reactor.evaluate((root) => {
    const probe: ReactorOwnershipProbe = {
      largestFrameGapsMs: [],
      maximumLeaving: 0,
      styleMutations: 0,
      heldPaintObservations: 0,
      holdViolations: [],
    };
    window.__reactorOwnershipProbe = probe;
    let pendingFrame: number | null = null;
    let lastFrameAt = performance.now();
    function sampleHold(): void {
      pendingFrame = null;
      const now = performance.now();
      probe.largestFrameGapsMs.push(now - lastFrameAt);
      probe.largestFrameGapsMs.sort((left, right) => right - left);
      probe.largestFrameGapsMs.length = Math.min(
        probe.largestFrameGapsMs.length,
        8,
      );
      lastFrameAt = now;
      const held = Array.from(
        root.querySelectorAll("[data-reactor-preparing]"),
      );
      if (held.length > 0) {
        probe.heldPaintObservations += 1;
        const visibleLeaving = Array.from(
          root.querySelectorAll("[data-reactor-leaving]"),
        ).filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.display !== "none" &&
            style.visibility === "visible" &&
            Number(style.opacity) > 0
          );
        }).length;
        if (visibleLeaving !== 1)
          probe.holdViolations.push(
            `Held paint ${probe.heldPaintObservations} has ${visibleLeaving} CSS-visible outgoing worlds.`,
          );
        for (const element of held) {
          const opacity = getComputedStyle(element).opacity;
          if (opacity !== "0")
            probe.holdViolations.push(
              `Held paint ${probe.heldPaintObservations}, ${element.getAttribute("data-flavor")}: incoming opacity is ${opacity}.`,
            );
        }
      }
      pendingFrame = requestAnimationFrame(sampleHold);
    }
    const observer = new MutationObserver((records) => {
      probe.maximumLeaving = Math.max(
        probe.maximumLeaving,
        root.querySelectorAll("[data-reactor-leaving]").length,
      );
      probe.styleMutations += records.filter(
        (record) => record.attributeName === "style",
      ).length;
    });
    function stop(): void {
      observer.disconnect();
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
      window.removeEventListener("pagehide", stop);
      delete window.__stopReactorOwnershipProbe;
    }
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "data-reactor-leaving"],
    });
    window.addEventListener("pagehide", stop, { once: true });
    window.__stopReactorOwnershipProbe = stop;
    pendingFrame = requestAnimationFrame(sampleHold);
  });
}

async function heldPaintCount(page: Page): Promise<number> {
  const count = await page.evaluate(
    () => window.__reactorOwnershipProbe?.heldPaintObservations,
  );
  if (count === undefined)
    throw new Error("Reactor held-paint observation is missing.");
  return count;
}

async function expectRestored(
  reactor: Locator,
  original: Awaited<ReturnType<typeof snapshot>>,
): Promise<void> {
  await expect(reactor.locator("[data-reactor-leaving]")).toHaveCount(0);
  await expect(reactor.locator("[data-reactor-preparing]")).toHaveCount(0);
  await expect
    .poll(() => snapshot(reactor.locator(OWNED_TARGETS)))
    .toEqual(original);
}

async function selectProduct(reactor: Locator, slug: string): Promise<void> {
  await reactor.locator(`[data-product-selector="${slug}"]`).click();
  await expect(reactor).toHaveAttribute("data-selected-product", slug);
  expect(
    await reactor.locator("[data-reactor-leaving]").count(),
  ).toBeLessThanOrEqual(1);
}

test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed() && testInfo.status !== testInfo.expectedStatus) {
    const presentation = await page
      .locator("[data-product-explorer]")
      .evaluate((root) => ({
        selected: root.getAttribute("data-selected-product"),
        frameProbe: window.__reactorOwnershipProbe,
        worlds: Array.from(root.querySelectorAll("[data-reactor-world]")).map(
          (world) => ({
            flavor: world.getAttribute("data-flavor"),
            selected: world.hasAttribute("data-motion-selected"),
            leaving: world.hasAttribute("data-reactor-leaving"),
            preparing: world.hasAttribute("data-reactor-preparing"),
          }),
        ),
        animations: root.getAnimations({ subtree: true }).map((animation) => ({
          id: animation.id,
          state: animation.playState,
          currentTime: animation.currentTime,
          startTime: animation.startTime,
          pending: animation.pending,
        })),
      }));
    await testInfo.attach("reactor-failed-presentation", {
      body: JSON.stringify(presentation),
      contentType: "application/json",
    });
  }
  if (!page.isClosed())
    await page.evaluate(() => window.__stopReactorOwnershipProbe?.());
});

for (const viewport of VIEWPORTS) {
  for (const preference of ["full", "lite"] as const) {
    test(`GIVEN ${preference} Reactor at ${viewport.width}px WHEN selection completes, supersedes and pauses THEN every authored declaration and visibility lease is restored`, async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "real-presentation-ownership",
        description:
          "An important-opacity fixture exercises GSAP fallback; the remaining worlds must use native effects. Real selectors, keyboard, history and preference controls verify ownership, not frame performance.",
      });
      const errors = await collectRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await armAuthoredBaseline(page);
      await page.goto("/uz/?motion=reduced&product=original");
      const reactor = page.locator("[data-product-explorer]");
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-runtime-state",
        "ready",
      );
      await expect(reactor).toHaveAttribute("data-enhanced", "true");
      await expect(reactor.locator("[data-reactor-world]")).toHaveCount(5);
      expect(await page.evaluate(() => window.__reactorOwnershipSeeded)).toBe(
        true,
      );
      const targets = reactor.locator(OWNED_TARGETS);
      expect(await targets.count()).toBeGreaterThan(25);
      const original = await snapshot(targets);
      await expect(
        reactor.locator('[data-flavor="original"] [data-motion-product]'),
      ).toHaveAttribute("style", /opacity:\s*0\.83\s*!important/u);
      await observeOwnership(reactor);
      await openConsumerMotionControls(page);
      await page
        .locator(
          `.menu-motion-console [data-motion-preference="${preference}"]`,
        )
        .click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        preference,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-runtime-state",
        "ready",
      );
      await closeConsumerMotionControls(page);
      await reactor.scrollIntoViewIfNeeded();
      await expect(reactor).toHaveAttribute("data-motion-ready", preference);
      await expect
        .poll(() =>
          page.evaluate(
            () => window.__reactorOwnershipProbe?.styleMutations ?? 0,
          ),
        )
        .toBeGreaterThan(0);
      await expectRestored(reactor, original);
      for (const slug of PRODUCT_SLUGS.slice(1)) {
        const heldBefore = await heldPaintCount(page);
        await selectProduct(reactor, slug);
        await expect(reactor.locator("[data-reactor-leaving]")).toHaveCount(1);
        if (slug !== "zero") {
          // Original's important fixture deliberately exercises the fallback;
          // the remaining unimportant worlds must exercise the native player.
          await expect
            .poll(() =>
              reactor.evaluate(
                (root) =>
                  root
                    .getAnimations({ subtree: true })
                    .filter((animation) =>
                      animation.id.startsWith("gorilla-reactor:"),
                    ).length,
              ),
            )
            .toBeGreaterThan(0);
        }
        await expectRestored(reactor, original);
        expect(await heldPaintCount(page)).toBeGreaterThan(heldBefore);
      }
      await reactor.locator("[data-reactor-gesture]").focus();
      for (const key of ["ArrowRight", "ArrowRight", "ArrowLeft"])
        await page.keyboard.press(key);
      await expect(reactor).toHaveAttribute(
        "data-selected-product",
        "original",
      );
      await page.goBack();
      await expect(reactor).toHaveAttribute("data-selected-product", "zero");
      await page.goForward();
      await expect(reactor).toHaveAttribute(
        "data-selected-product",
        "original",
      );
      await expectRestored(reactor, original);
      await openConsumerMotionControls(page);
      // Real same-document history starts a fresh transition while the preference control is available.
      await page.goBack();
      await expect(reactor).toHaveAttribute("data-selected-product", "zero");
      await expect(reactor.locator("[data-reactor-leaving]")).toHaveCount(1);
      await page
        .locator('.menu-motion-console [data-motion-preference="reduced"]')
        .click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-runtime-state",
        "ready",
      );
      await page.evaluate(async (frames) => {
        for (let frame = 0; frame < frames; frame += 1)
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          );
      }, POST_CLEANUP_FRAMES);
      await expectRestored(reactor, original);
      const probe = await page.evaluate(() => window.__reactorOwnershipProbe);
      if (probe === undefined)
        throw new Error("Reactor ownership observation is missing.");
      expect(probe.styleMutations).toBeGreaterThan(0);
      expect(probe.maximumLeaving).toBeLessThanOrEqual(1);
      expect(probe.heldPaintObservations).toBeGreaterThan(0);
      expect(probe.holdViolations).toEqual([]);
      await closeConsumerMotionControls(page);
      expect(errors).toEqual([]);
    });
  }
}
