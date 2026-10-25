import { expect, test } from "@playwright/test";

import { readComparePresentationResidue } from "./support/compare-presentation";

const ROUTE = "/uz/compare/?products=original,zero,extra&motion=static";
const EXTRA_ACTION =
  '[data-product-slug="extra"][data-compare-product] .signal-channel__copy a';
const DIAGNOSTIC_OPACITY = "0.5";

test.use({ contextOptions: { reducedMotion: "reduce" } });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-compare-root]")).toHaveAttribute(
    "data-selection-count",
    "3",
  );
});

test("GIVEN an actual comparison action with inline opacity WHEN presentation is inspected THEN the exact product target and value remain visible until cleared", async ({
  page,
}) => {
  expect(await readComparePresentationResidue(page)).toEqual([]);
  const action = page.locator(EXTRA_ACTION);
  await action.evaluate((element, value) => {
    element.style.opacity = value;
  }, DIAGNOSTIC_OPACITY);
  expect(await readComparePresentationResidue(page)).toEqual([
    {
      product: "extra",
      selected: true,
      target: "text-link",
      styles: { opacity: DIAGNOSTIC_OPACITY },
    },
  ]);
  await action.evaluate((element) => element.style.removeProperty("opacity"));
  expect(await readComparePresentationResidue(page)).toEqual([]);
});

test("GIVEN a comparison root without its required presentation targets WHEN inspected THEN missing targets cannot produce a vacuous cleanup pass", async ({
  page,
}) => {
  await page
    .locator("[data-compare-root]")
    .evaluate((root) => root.replaceChildren());
  await expect(readComparePresentationResidue(page)).rejects.toThrow(
    "Comparison presentation targets must exist.",
  );
});
