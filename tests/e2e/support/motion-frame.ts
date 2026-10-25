import type { Page } from "@playwright/test";

/** Observe frame-driven state on the browser's clock, not a host timer. */
export async function expectMotionFrameState(
  page: Page,
  state: Readonly<{
    selector: string;
    attribute: string;
    value: string;
    timeout: number;
  }>,
): Promise<void> {
  const result = await page.waitForFunction(
    ({ selector, attribute, value }) =>
      document.querySelector(selector)?.getAttribute(attribute) === value,
    state,
    { polling: "raf", timeout: state.timeout },
  );
  await result.dispose();
}
