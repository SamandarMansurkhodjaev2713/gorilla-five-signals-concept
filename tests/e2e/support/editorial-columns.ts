import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export const EDITORIAL_COLUMN_SELECTORS = [
  ".manifesto-intro",
  "[data-product-card] .reactor-copy",
  ".home-truth__heading",
  ".home-duel__action",
] as const;

const OVERFLOW_TOLERANCE_PX = 1;
const TEXT_SAMPLE_LIMIT = 80;

interface ColumnMeasurement {
  readonly clientWidth: number;
  readonly sample: string | undefined;
  readonly scrollWidth: number;
  readonly visibleInViewport: boolean;
}

function measureColumns(
  elements: Element[],
  sampleLimit: number,
): ColumnMeasurement[] {
  return elements.flatMap((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      rect.width <= 0 ||
      rect.height <= 0 ||
      element.clientWidth <= 0
    )
      return [];
    return [
      {
        clientWidth: element.clientWidth,
        sample: element.textContent?.trim().slice(0, sampleLimit),
        scrollWidth: element.scrollWidth,
        visibleInViewport:
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth,
      },
    ];
  });
}

async function paintFamily(columns: Locator, page: Page): Promise<void> {
  await columns
    .first()
    .evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "center" }),
    );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

function assertMeasuredFamily(
  measurements: readonly ColumnMeasurement[],
  selector: string,
): void {
  expect(
    measurements.some((measurement) => measurement.visibleInViewport),
    selector,
  ).toBe(true);
  expect(
    measurements.filter(
      (measurement) =>
        measurement.scrollWidth >
        measurement.clientWidth + OVERFLOW_TOLERANCE_PX,
    ),
    selector,
  ).toEqual([]);
}

/** Native paint and nonempty visible measurements prevent placeholder/404 passes. */
export async function verifyEditorialColumnFamily(
  page: Page,
  selector: string,
): Promise<void> {
  const columns = page.locator(selector);
  expect(await columns.count(), selector).toBeGreaterThan(0);
  await paintFamily(columns, page);
  const measurements = await columns.evaluateAll(
    measureColumns,
    TEXT_SAMPLE_LIMIT,
  );
  assertMeasuredFamily(measurements, selector);
}
