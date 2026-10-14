import type { Buffer } from "node:buffer";

import { expect, type Locator } from "@playwright/test";
import sharp from "sharp";

const MIN_CAPTURE_CHANNEL_DEVIATION = 1;

export async function prepareSectionCapture(section: Locator): Promise<void> {
  await section.evaluate(async (element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  await expect
    .poll(() =>
      section
        .locator("img:visible")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
}

/** Reject a uniform placeholder; visual acceptance still requires review. */
export async function expectCaptureContent(capture: Buffer): Promise<void> {
  const statistics = await sharp(capture).stats();
  expect(
    statistics.channels.some(
      (channel) => channel.stdev > MIN_CAPTURE_CHANNEL_DEVIATION,
    ),
    "A section capture must contain rendered content, not a uniform placeholder.",
  ).toBe(true);
}
