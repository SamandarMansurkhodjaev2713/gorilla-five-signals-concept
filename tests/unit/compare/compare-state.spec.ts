import { describe, expect, it } from "vitest";

import {
  createFindHref,
  createShareUrl,
  isPresent,
  selectionFromUrl,
  slotLimitForViewport,
  uniqueValidSlugs,
} from "@/features/compare/compare-state";

const VALID_SLUGS = new Set([
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
]);

describe("compare selection state", () => {
  it("GIVEN optional slug values WHEN presence is checked THEN only non-empty strings are accepted", () => {
    expect(isPresent(undefined)).toBe(false);
    expect(isPresent("")).toBe(false);
    expect(isPresent("original")).toBe(true);
  });

  it("GIVEN empty, duplicate, and unknown values WHEN normalized THEN only unique valid slugs within the limit remain", () => {
    expect(
      uniqueValidSlugs(
        ["", "zero", "unknown", "zero", "extra", "original"],
        VALID_SLUGS,
        2,
      ),
    ).toEqual(["zero", "extra"]);
  });

  it("GIVEN a non-positive limit WHEN normalized THEN no selection is returned", () => {
    expect(uniqueValidSlugs(["original"], VALID_SLUGS, 0)).toEqual([]);
    expect(uniqueValidSlugs(["original"], VALID_SLUGS, -1)).toEqual([]);
  });

  it("GIVEN no products parameter WHEN location is read THEN bounded defaults are used without mutation", () => {
    const defaults = ["original", "zero", "extra"];
    const result = selectionFromUrl(
      new URL("https://example.test/uz/compare/?campaign=signal"),
      defaults,
      VALID_SLUGS,
      2,
    );

    expect(result).toEqual(["original", "zero"]);
    expect(defaults).toEqual(["original", "zero", "extra"]);
  });

  it("GIVEN an explicit empty or invalid parameter WHEN location is read THEN defaults are not reintroduced", () => {
    expect(
      selectionFromUrl(
        new URL("https://example.test/uz/compare/?products="),
        ["original", "zero"],
        VALID_SLUGS,
        3,
      ),
    ).toEqual([]);
    expect(
      selectionFromUrl(
        new URL("https://example.test/uz/compare/?products=unknown"),
        ["original", "zero"],
        VALID_SLUGS,
        3,
      ),
    ).toEqual([]);
  });
});

describe("compare URL state", () => {
  it("GIVEN an existing route URL WHEN a share URL is created THEN path, unrelated query, and hash are preserved", () => {
    const url = createShareUrl(
      "https://example.test/ru/compare/?campaign=signal#matrix",
      ["zero", "extra"],
    );

    expect(url.href).toBe(
      "https://example.test/ru/compare/?campaign=signal&products=zero%2Cextra#matrix",
    );
  });

  it("GIVEN an empty selection WHEN a share URL is created THEN the explicit empty state remains shareable", () => {
    expect(
      createShareUrl(
        "https://example.test/uz/compare/?products=original",
        [],
      ).searchParams.get("products"),
    ).toBe("");
  });

  it("GIVEN a find base WHEN a product is selected THEN only the first product is added to the local href", () => {
    expect(
      createFindHref("/uz/find/?campaign=signal", "https://example.test", [
        "mango-coconut",
        "extra",
      ]),
    ).toBe("/uz/find/?campaign=signal&product=mango-coconut");
    expect(createFindHref("/uz/find/", "https://example.test", [])).toBe(
      "/uz/find/",
    );
  });

  it("GIVEN a viewport tier WHEN its limit is resolved THEN compact and desktop contracts remain explicit", () => {
    expect(slotLimitForViewport("compact")).toBe(2);
    expect(slotLimitForViewport("desktop")).toBe(3);
  });
});
