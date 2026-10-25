import { expect, test, type Page } from "@playwright/test";

import { collectRuntimeErrors } from "./support/site";

const PRODUCT_HISTORY_KEY = "gorilla:product-explorer";
const SCROLL_TOLERANCE_PX = 1;

interface ProductHistoryProbe {
  reactor: HTMLElement;
  product: HTMLElement;
  swaps: number;
  stop(): void;
}

declare global {
  interface Window {
    __productHistoryProbe?: ProductHistoryProbe;
  }
}

async function paint(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function readMetadata(page: Page) {
  return page.evaluate((productKey) => {
    const state: unknown = history.state;
    if (typeof state !== "object" || state === null || Array.isArray(state))
      throw new Error("Native framework history metadata is missing.");
    const preserved: Record<string, unknown> = {};
    for (const key of Object.keys(state)) {
      if (key === productKey || key === "scrollX" || key === "scrollY")
        continue;
      const value: unknown = Reflect.get(state, key);
      preserved[key] = value;
    }
    const product: unknown = Reflect.get(state, productKey);
    const x: unknown = Reflect.get(state, "scrollX");
    const y: unknown = Reflect.get(state, "scrollY");
    return {
      preserved,
      product,
      nativeScroll: {
        x,
        y,
      },
    };
  }, PRODUCT_HISTORY_KEY);
}

async function expectSelected(page: Page, product: string): Promise<void> {
  await expect(page.locator("[data-product-explorer]")).toHaveAttribute(
    "data-selected-product",
    product,
  );
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/uz/" && url.searchParams.get("product") === product,
  );
}

async function expectSameDocument(
  page: Page,
  product: string,
  originalY: number,
): Promise<void> {
  await expectSelected(page, product);
  await paint(page);
  const identity = await page.evaluate(() => {
    const probe = window.__productHistoryProbe;
    if (probe === undefined)
      throw new Error("Product history ownership probe is missing.");
    return {
      reactor:
        probe.reactor === document.querySelector("[data-product-explorer]"),
      product:
        probe.product ===
        document.querySelector(
          '[data-reactor-world][data-flavor="original"] [data-motion-product]',
        ),
      connected: probe.reactor.isConnected && probe.product.isConnected,
      swaps: probe.swaps,
      y: scrollY,
    };
  });
  expect(identity).toMatchObject({
    reactor: true,
    product: true,
    connected: true,
    swaps: 0,
  });
  expect(Math.abs(identity.y - originalY)).toBeLessThanOrEqual(
    SCROLL_TOLERANCE_PX,
  );
}

test.afterEach(async ({ page }) => {
  if (!page.isClosed())
    await page.evaluate(() => window.__productHistoryProbe?.stop());
});

test("GIVEN framework-owned history WHEN product entries traverse THEN home DOM persists while real route navigation remains Astro-owned", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "native-history-ownership",
    description:
      "Real clicks and browser back/forward only. Framework metadata is compared excluding the product namespace and authoritative browser-maintained scrollX/scrollY updates.",
  });
  const errors = await collectRuntimeErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "full");
  });
  await page.goto("/uz/?product=original");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-runtime-state",
    "ready",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    "full",
  );
  const reactor = page.locator("[data-product-explorer]");
  await expect(reactor).toHaveAttribute("data-enhanced", "true");
  await reactor.scrollIntoViewIfNeeded();
  await expect(reactor).toHaveAttribute("data-motion-ready", "full");
  await expectSelected(page, "original");
  await page.evaluate(() => {
    const reactor = document.querySelector("[data-product-explorer]");
    const product = document.querySelector(
      '[data-reactor-world][data-flavor="original"] [data-motion-product]',
    );
    if (!(reactor instanceof HTMLElement) || !(product instanceof HTMLElement))
      throw new Error("Real Reactor and product nodes are required.");
    const probe: ProductHistoryProbe = { reactor, product, swaps: 0, stop };
    function onSwap(): void {
      probe.swaps += 1;
    }
    function stop(): void {
      document.removeEventListener("astro:before-swap", onSwap);
      window.removeEventListener("pagehide", stop);
    }
    document.addEventListener("astro:before-swap", onSwap);
    window.addEventListener("pagehide", stop, { once: true });
    window.__productHistoryProbe = probe;
  });
  for (const product of ["zero", "extra"]) {
    const before = await readMetadata(page);
    await reactor.locator(`[data-product-selector="${product}"]`).click();
    await expectSelected(page, product);
    const after = await readMetadata(page);
    expect(after.preserved).toEqual(before.preserved);
    expect(after.product).toEqual({
      ownerPathname: "/uz/",
      product,
      version: 1,
    });
    for (const coordinate of [after.nativeScroll.x, after.nativeScroll.y])
      if (coordinate !== undefined) {
        expect(typeof coordinate).toBe("number");
        expect(Number.isFinite(coordinate)).toBe(true);
      }
  }
  await paint(page);
  const originalY = await page.evaluate(() => scrollY);
  await page.goBack();
  await expectSameDocument(page, "zero", originalY);
  await page.goForward();
  await expectSameDocument(page, "extra", originalY);
  const products = page.locator('.hero-primary-action[href="/uz/products/"]');
  await expect(products).toHaveCount(1);
  await products.click();
  await expect(page).toHaveURL((url) => url.pathname === "/uz/products/");
  await expect(page.locator("[data-product-explorer]")).toHaveCount(0);
  const departure = await page.evaluate(() => {
    const probe = window.__productHistoryProbe;
    if (probe === undefined)
      throw new Error("Product history ownership probe was lost.");
    return {
      connected: probe.reactor.isConnected || probe.product.isConnected,
      swaps: probe.swaps,
    };
  });
  expect(departure.connected).toBe(false);
  expect(departure.swaps).toBeGreaterThan(0);
  await page.goBack();
  await expectSelected(page, "extra");
  await expect(page.locator("[data-product-explorer]")).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await page.goForward();
  await expect(page).toHaveURL((url) => url.pathname === "/uz/products/");
  await expect(page.locator("[data-product-explorer]")).toHaveCount(0);
  expect(errors).toEqual([]);
});
