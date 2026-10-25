import { expect, type Locator, type Page } from "@playwright/test";

const REQUIRED_STABLE_OBSERVATIONS = 2;

async function readSummaryHit(summary: Locator) {
  return summary.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
    );
    return {
      position: `${String(rect.x)}:${String(rect.y)}:${String(rect.width)}:${String(rect.height)}`,
      hittable: hit !== null && element.contains(hit),
    };
  });
}

/** Click only a settled, unobscured native disclosure; no forced or DOM activation. */
export async function clickNativeSummary(
  page: Page,
  summary: Locator,
): Promise<void> {
  await summary.scrollIntoViewIfNeeded();
  let previousPosition = "";
  let stableObservations = 0;
  await expect
    .poll(async () => {
      await summary.scrollIntoViewIfNeeded();
      const state = await readSummaryHit(summary);
      stableObservations =
        state.hittable && state.position === previousPosition
          ? stableObservations + 1
          : 0;
      previousPosition = state.position;
      return stableObservations >= REQUIRED_STABLE_OBSERVATIONS;
    })
    .toBe(true);
  await expect(summary).toBeInViewport({ ratio: 1 });
  const bounds = await summary.boundingBox();
  if (bounds === null) throw new Error("Native summary has no painted bounds.");
  await page.mouse.click(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
}
