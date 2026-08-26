import { describe, expect, it } from "vitest";

import {
  canonicalizePagePath,
  createCanonicalHref,
} from "@/features/site/canonical";

describe("canonical page URLs", () => {
  it.each([
    ["/", "/"],
    ["/uz", "/uz/"],
    ["/uz/", "/uz/"],
    ["/uz/products/original///", "/uz/products/original/"],
  ])(
    "GIVEN %s WHEN normalized THEN the canonical path is %s",
    (pathname, expected) => {
      expect(canonicalizePagePath(pathname)).toBe(expected);
    },
  );

  it("GIVEN a relative path WHEN normalized THEN validation fails", () => {
    expect(() => canonicalizePagePath("uz/products")).toThrow(
      /absolute page path/u,
    );
  });

  it.each(["/uz/find?flavor=zero", "/uz/find#results"])(
    "GIVEN a pathname polluted by URL state %s WHEN normalized THEN validation fails",
    (pathname) => {
      expect(() => canonicalizePagePath(pathname)).toThrow(
        /without query or fragment/u,
      );
    },
  );

  it("GIVEN a public origin WHEN resolved THEN an absolute canonical is returned", () => {
    expect(
      createCanonicalHref(
        "/uz/products/original",
        new URL("https://concept.example.com"),
      ),
    ).toBe("https://concept.example.com/uz/products/original/");
  });

  it("GIVEN no public origin WHEN resolved THEN a normalized path is returned", () => {
    expect(createCanonicalHref("/uz/find")).toBe("/uz/find/");
  });
});
