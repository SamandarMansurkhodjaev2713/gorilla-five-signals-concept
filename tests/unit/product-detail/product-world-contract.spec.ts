import { describe, expect, it } from "vitest";

import {
  isProductSlug,
  PRODUCT_SLUGS,
  PRODUCT_WORLD_SPECS,
  productTitleScale,
  requireProductSlug,
} from "@/features/product-detail/product-world-contract";

describe("product-world contract", () => {
  it("GIVEN the approved product set WHEN world specs are read THEN every slug has a unique complete signature", () => {
    const specs = PRODUCT_SLUGS.map((slug) => PRODUCT_WORLD_SPECS[slug]);

    expect(specs).toHaveLength(PRODUCT_SLUGS.length);
    expect(new Set(specs.map(({ geometry }) => geometry)).size).toBe(
      PRODUCT_SLUGS.length,
    );
    expect(new Set(specs.map(({ material }) => material)).size).toBe(
      PRODUCT_SLUGS.length,
    );
    expect(new Set(specs.map(({ motionPath }) => motionPath)).size).toBe(
      PRODUCT_SLUGS.length,
    );
  });

  it("GIVEN valid and unknown slugs WHEN runtime guards execute THEN only the approved union passes", () => {
    for (const slug of PRODUCT_SLUGS) {
      expect(isProductSlug(slug)).toBe(true);
      expect(requireProductSlug(slug)).toBe(slug);
    }

    expect(isProductSlug("ultra")).toBe(false);
    expect(() => requireProductSlug("ultra")).toThrow(
      "Unsupported product world: ultra.",
    );
  });

  it("GIVEN localized names WHEN title scale is selected THEN long unbroken labels receive more space", () => {
    expect(productTitleScale("Zero")).toBe("standard");
    expect(productTitleScale("Original")).toBe("extended");
    expect(productTitleScale("Mango-Coconut")).toBe("compact");
  });
});
