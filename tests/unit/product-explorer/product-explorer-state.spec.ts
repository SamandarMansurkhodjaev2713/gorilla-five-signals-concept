import { describe, expect, it } from "vitest";

import {
  resolveInitialProduct,
  resolveRelativeProduct,
} from "@/features/product-explorer/product-explorer-state";

const PRODUCTS = ["original", "zero", "extra"] as const;

describe("product explorer state", () => {
  it("GIVEN an empty catalog WHEN initial selection resolves THEN no product is returned", () => {
    expect(resolveInitialProduct([], null)).toBeNull();
  });

  it("GIVEN a valid requested product WHEN initial selection resolves THEN the request wins", () => {
    expect(resolveInitialProduct(PRODUCTS, "extra")).toBe("extra");
  });

  it("GIVEN an unknown request WHEN initial selection resolves THEN the first product wins", () => {
    expect(resolveInitialProduct(PRODUCTS, "missing")).toBe("original");
  });

  it("GIVEN the last product WHEN next resolves THEN selection wraps to the first", () => {
    expect(resolveRelativeProduct(PRODUCTS, "extra", "next")).toBe("original");
  });

  it("GIVEN the first product WHEN previous resolves THEN selection wraps to the last", () => {
    expect(resolveRelativeProduct(PRODUCTS, "original", "previous")).toBe(
      "extra",
    );
  });

  it("GIVEN a stale selected slug WHEN relative selection resolves THEN it starts from the first slot", () => {
    expect(resolveRelativeProduct(PRODUCTS, "missing", "next")).toBe("zero");
    expect(resolveRelativeProduct(PRODUCTS, "missing", "previous")).toBe(
      "extra",
    );
  });

  it("GIVEN an empty catalog WHEN relative selection resolves THEN no product is returned", () => {
    expect(resolveRelativeProduct([], "original", "next")).toBeNull();
  });
});
