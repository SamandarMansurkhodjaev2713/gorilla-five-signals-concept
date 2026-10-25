import type { Page } from "@playwright/test";

const ROOT = "[data-compare-root]";
const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "translate",
  "visibility",
] as const;

/** Report the same cleanup contract without concealing target/value evidence behind a boolean. */
export async function readComparePresentationResidue(page: Page) {
  return page.locator(ROOT).evaluate((root, properties) => {
    const targets = [
      ...root.querySelectorAll<HTMLElement>(
        "[data-motion-product], .signal-channel__copy > *",
      ),
    ];
    if (targets.length === 0)
      throw new Error("Comparison presentation targets must exist.");
    return targets.flatMap((element) => {
      const styles: Partial<Record<(typeof properties)[number], string>> = {};
      for (const property of properties) {
        const value = element.style.getPropertyValue(property);
        if (value !== "") styles[property] = value;
      }
      if (Object.keys(styles).length === 0) return [];
      const product = element.closest<HTMLElement>("[data-compare-product]");
      return [
        {
          product: product?.dataset.productSlug ?? null,
          selected: product !== null && !product.hidden,
          target: element.className,
          styles,
        },
      ];
    });
  }, PRESENTATION_PROPERTIES);
}
