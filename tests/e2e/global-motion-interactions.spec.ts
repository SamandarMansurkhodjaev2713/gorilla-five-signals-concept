import { expect, test, type Page } from "@playwright/test";

const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const PREFERENCE_KEY = "gorilla:motion-preference:v1";
const DESKTOP_VIEWPORT = { height: 900, width: 1_440 } as const;
const ROUTE_HANDOFF_BUDGET_MS = 900;

async function openWithPreference(
  page: Page,
  preference: "full" | "reduced",
): Promise<void> {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(
    ({ confirmationKey, motionPreference, preferenceKey }) => {
      sessionStorage.setItem(confirmationKey, "true");
      localStorage.setItem(preferenceKey, motionPreference);
    },
    {
      confirmationKey: CONFIRMATION_KEY,
      motionPreference: preference,
      preferenceKey: PREFERENCE_KEY,
    },
  );
  await page.goto("/uz/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-tier",
    preference,
  );
}

async function openSignalMenu(page: Page): Promise<void> {
  const menu = page.locator("[data-motion-menu]");
  await menu.locator(":scope > summary").click();
  await expect(menu).toHaveAttribute("open", "");
}

test.describe("global route and navigation motion", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN Full and a fine pointer WHEN header intent moves and releases THEN feedback is bounded, finite, and header-owned", async ({
    page,
  }) => {
    await openWithPreference(page, "full");
    const header = page.locator(".site-header");
    const target = header.locator(":scope > [data-motion-toggle]");
    await expect(header).toHaveAttribute("data-pointer-feedback", "magnetic");

    const bounds = await target.boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds === null) {
      return;
    }
    await page.mouse.move(bounds.x + bounds.width - 1, bounds.y + 2);
    await expect(target).toHaveAttribute("data-motion-magnetic", "tracking");
    const offset = await target.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return Math.max(Math.abs(matrix.m41), Math.abs(matrix.m42));
    });
    expect(offset).toBeGreaterThan(0);
    expect(offset).toBeLessThanOrEqual(4.5);

    await page.mouse.move(bounds.x, bounds.y + bounds.height + 80);
    await expect(target).not.toHaveAttribute("data-motion-magnetic", /.+/u);
    await expect
      .poll(() => target.evaluate((element) => element.style.transform))
      .toBe("");
    await expect(
      page.locator(
        '[data-motion-scene="flavor-explorer"] [data-motion-magnetic]',
      ),
    ).toHaveCount(0);

    await page.evaluate(() =>
      document.dispatchEvent(new Event("astro:after-swap")),
    );
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-phase",
      "arriving",
    );
    await target.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-tier",
      "reduced",
    );
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-phase",
      "idle",
    );
    await expect(header).not.toHaveAttribute("data-pointer-feedback", /.+/u);
    await expect
      .poll(() => target.evaluate((element) => element.style.transform))
      .toBe("");
  });

  test("GIVEN rapid menu intents WHEN the final intent is open THEN native focus wins and all presentation residue clears", async ({
    page,
  }) => {
    await openWithPreference(page, "full");
    const menu = page.locator("[data-motion-menu]");
    await openSignalMenu(page);
    await menu.locator("[data-motion-menu-close]").click();
    await menu.locator(":scope > summary").click();
    await expect(menu.locator("[data-motion-menu-close]")).toBeFocused();
    await page.keyboard.press("Tab");

    await expect(menu).toHaveAttribute("open", "");
    await expect(page.locator(".site-header")).not.toHaveAttribute(
      "data-menu-motion",
      /.+/u,
    );
    const residue = await menu
      .locator("nav a, .menu-motion-console, .menu-locales")
      .evaluateAll(
        (elements) =>
          elements.filter((element) => {
            return (
              element instanceof HTMLElement &&
              (element.style.opacity !== "" || element.style.transform !== "")
            );
          }).length,
      );
    expect(residue).toBe(0);
    await expect(menu.locator("nav a").first()).toBeFocused();
  });

  test("GIVEN Full route handoffs WHEN contact and home are requested THEN they stay bounded and preserve semantic continuity", async ({
    page,
  }) => {
    await openWithPreference(page, "full");
    await openSignalMenu(page);
    const elapsed = await page.evaluate(
      ({ budgetMs }) =>
        new Promise<number>((resolve, reject) => {
          const timeout = window.setTimeout(
            () => reject(new Error("Route handoff exceeded its budget.")),
            budgetMs,
          );
          const startedAt = performance.now();
          document.addEventListener(
            "astro:page-load",
            () => {
              window.clearTimeout(timeout);
              resolve(performance.now() - startedAt);
            },
            { once: true },
          );
          const anchor = document.querySelector<HTMLAnchorElement>(
            '.mobile-navigation nav a[href="/uz/contact/"]',
          );
          if (anchor === null) {
            window.clearTimeout(timeout);
            reject(new Error("The Contact route control is missing."));
            return;
          }
          anchor.click();
        }),
      { budgetMs: ROUTE_HANDOFF_BUDGET_MS },
    );
    expect(elapsed).toBeLessThanOrEqual(ROUTE_HANDOFF_BUDGET_MS);
    await expect(page).toHaveURL(/\/uz\/contact\/$/u);
    await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-motion",
      "full",
    );

    await page.locator(".site-header > .brand").click();
    await expect(page).toHaveURL(/\/uz\/$/u);
    await expect(page.locator("[data-route-signal-code]")).toHaveText("HOME");
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-motion",
      "full",
    );
  });

  test("GIVEN Reduced WHEN route, menu, and hash navigation are used THEN all native contracts remain without spatial residue", async ({
    page,
  }) => {
    await openWithPreference(page, "reduced");
    const header = page.locator(".site-header");
    await expect(header).not.toHaveAttribute("data-pointer-feedback", /.+/u);
    await openSignalMenu(page);
    await expect(header).not.toHaveAttribute("data-menu-motion", /.+/u);

    await page.locator('.mobile-navigation nav a[href="/uz/contact/"]').click();
    await expect(page).toHaveURL(/\/uz\/contact\/$/u);
    await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-phase",
      "idle",
    );

    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/uz\/contact\/#main-content$/u);
    await expect(page.locator("main#main-content")).toBeFocused();
    await expect(page.locator("[data-route-signal]")).toHaveAttribute(
      "data-route-phase",
      "idle",
    );
  });
});
