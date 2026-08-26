import { expect, test } from "@playwright/test";

import {
  PRODUCT_SLUGS,
  expectNoHorizontalOverflow,
  expectSemanticPage,
} from "./support/site";

const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;

test.describe("product detail art direction", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() =>
      sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
    );
  });

  test("GIVEN five flavor routes WHEN rendered on mobile THEN each has a distinct, reduced-motion-safe identity without overflow", async ({
    page,
  }) => {
    const visualFingerprints = new Set<string>();

    for (const slug of PRODUCT_SLUGS) {
      await expectSemanticPage(page, "uz", `/products/${slug}`);
      const art = page.locator(`[data-detail-art="${slug}"]`);
      const can = page.locator(".can-stage img");

      await expect(art).toHaveCount(1);
      await expect(art).toHaveAttribute("aria-hidden", "true");
      await expect(art).toBeVisible();
      await expect(can).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-tier",
        "reduced",
      );
      await expectNoHorizontalOverflow(page);

      const fingerprint = await art
        .locator(".flavor-art__field")
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return [
            style.backgroundImage,
            style.borderBlockStartStyle,
            style.clipPath,
            style.transform,
          ].join("|");
        });
      visualFingerprints.add(fingerprint);
    }

    expect(visualFingerprints.size).toBe(PRODUCT_SLUGS.length);
  });
});
