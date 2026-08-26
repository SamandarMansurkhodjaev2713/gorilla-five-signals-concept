import { expect, type Page } from "@playwright/test";

export const LOCALES = ["uz", "ru", "en"] as const;
export const PRODUCT_SLUGS = [
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
] as const;

export const ROUTE_SUFFIXES = [
  "",
  "/products",
  ...PRODUCT_SLUGS.map((slug) => `/products/${slug}`),
  "/compare",
  "/find",
  "/culture",
  "/faq",
  "/contact",
  "/legal/privacy",
  "/legal/product-information",
] as const;

export const ENGINE_SMOKE_SUFFIXES = [
  "",
  "/products/original",
  "/compare",
  "/find",
  "/culture",
  "/faq",
  "/contact",
] as const;

export const HOME_SCENE_IDS = [
  "hero",
  "range-manifesto",
  "flavor-explorer",
  "product-lab",
  "product-compare",
  "material-film",
  "culture-signal",
  "store-locator",
  "faq-safety",
  "contact-partnership",
  "footer",
] as const;

export const HOME_RUNTIME_SCENE_IDS = [
  "navigation",
  "responsible-entry",
  ...HOME_SCENE_IDS,
] as const;

export const VISUAL_VIEWPORTS = [
  { name: "compact-320", width: 320, height: 568 },
  { name: "compact-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-412", width: 412, height: 915 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "phone-landscape-844", width: 844, height: 390 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "landscape-1024", width: 1024, height: 768 },
  { name: "desktop-1366", width: 1366, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
] as const;

export type Locale = (typeof LOCALES)[number];

export function localizedPath(locale: Locale, suffix = ""): string {
  const suffixIndex = suffix.search(/[?#]/u);
  const pathname = suffixIndex < 0 ? suffix : suffix.slice(0, suffixIndex);
  const urlSuffix = suffixIndex < 0 ? "" : suffix.slice(suffixIndex);
  const normalizedSuffix = pathname.split("/").filter(Boolean).join("/");
  const localized =
    normalizedSuffix === "" ? `/${locale}/` : `/${locale}/${normalizedSuffix}/`;
  return `${localized}${urlSuffix}`;
}

export async function acceptResponsibleEntry(page: Page): Promise<void> {
  const dialog = page.locator("[data-responsible-entry]");
  if (await dialog.isVisible()) {
    await dialog.locator("[data-responsible-continue]").click();
  }
}

export async function expectSemanticPage(
  page: Page,
  locale: Locale,
  suffix = "",
): Promise<void> {
  const response = await page.goto(localizedPath(locale, suffix), {
    waitUntil: "domcontentloaded",
  });

  expect(response, `Missing response for ${locale}${suffix}`).not.toBeNull();
  expect(response?.ok(), `Unsuccessful response for ${locale}${suffix}`).toBe(
    true,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page).toHaveTitle(/\S+/);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export async function collectRuntimeErrors(
  page: Page,
): Promise<readonly string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  await page.exposeFunction(
    "__recordMotionDiagnostic",
    (message: string): void => {
      errors.push(message);
    },
  );
  await page.addInitScript(() => {
    window.addEventListener("gorilla:motion-diagnostic", (event) => {
      const detail: unknown = "detail" in event ? event.detail : undefined;
      const recordValue: unknown =
        "__recordMotionDiagnostic" in window
          ? window.__recordMotionDiagnostic
          : undefined;
      const message =
        typeof detail === "object" && detail !== null
          ? JSON.stringify(detail)
          : String(detail);
      if (typeof recordValue !== "function") {
        throw new Error("Motion diagnostic recorder is unavailable.");
      }
      const recordResult: unknown = Reflect.apply(recordValue, undefined, [
        `motion-diagnostic: ${message}`,
      ]);
      void Promise.resolve(recordResult).catch((error: unknown) => {
        queueMicrotask(() => {
          throw error;
        });
      });
    });
  });
  return errors;
}
