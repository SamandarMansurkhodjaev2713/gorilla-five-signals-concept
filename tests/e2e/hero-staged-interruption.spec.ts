import { expect, test, type Page } from "@playwright/test";

import {
  HERO_PRESENTATION_TARGETS,
  snapshotHeroPresentation,
} from "./support/hero-presentation";

const CANCELLATION_SETTLE_FRAMES = 4;

async function installCancellationProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("gorilla:motion-preference:v1", "full");
    const nativeAdd: unknown = Reflect.get(
      EventTarget.prototype,
      "addEventListener",
    );
    if (typeof nativeAdd !== "function")
      throw new Error("Native registration is unavailable.");
    EventTarget.prototype.addEventListener = function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ): void {
      if (
        type === "pointermove" &&
        this instanceof HTMLElement &&
        this.matches(".hero")
      ) {
        Reflect.set(EventTarget.prototype, "addEventListener", nativeAdd);
        // Fault injection at a real stage boundary, not a native user-input claim.
        queueMicrotask(() => {
          const html = document.documentElement;
          const hero = document.querySelector(".hero");
          if (!(hero instanceof HTMLElement))
            throw new Error("Missing Hero root.");
          html.dataset.testStagedReadyBeforeCancel = String(
            hero.dataset.motionReady,
          );
          html.dataset.testStagedStateBeforeCancel = String(
            html.dataset.motionRuntimeState,
          );
          const pause = document.querySelector(
            'button[data-motion-preference="reduced"]',
          );
          if (!(pause instanceof HTMLButtonElement))
            throw new Error("Missing real preference control.");
          pause.click();
          html.dataset.testStagedCancel = "injected";
        });
      }
      Reflect.apply(nativeAdd, this, [type, listener, options]);
    };
  });
}

test("GIVEN partially installed Full Hero WHEN capability changes between stages THEN ready belongs only to the new generation and styles stay restored", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await installCancellationProbe(page);
  await page.goto("/uz/");
  await expect(page.locator("[data-responsible-entry]")).toBeVisible();
  const targets = page.locator(".hero").locator(HERO_PRESENTATION_TARGETS);
  const original = await snapshotHeroPresentation(targets);
  await page.locator("[data-responsible-continue]").click();
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-test-staged-cancel", "injected");
  await expect(html).toHaveAttribute(
    "data-test-staged-ready-before-cancel",
    "undefined",
  );
  await expect(html).toHaveAttribute(
    "data-test-staged-state-before-cancel",
    "loading",
  );
  await expect(html).toHaveAttribute("data-motion-runtime-state", "ready");
  await expect(html).toHaveAttribute("data-motion-tier", "reduced");
  await page.evaluate(async (frameCount) => {
    for (let frame = 0; frame < frameCount; frame += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }
  }, CANCELLATION_SETTLE_FRAMES);
  await expect(page.locator(".hero")).toHaveAttribute(
    "data-motion-ready",
    "reduced",
  );
  expect(await snapshotHeroPresentation(targets)).toEqual(original);
});
