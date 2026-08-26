import { describe, expect, it } from "vitest";

import {
  createLocatorUrl,
  hasMatchingLocatorSlugs,
  resolveLocatorSlug,
} from "@/features/locator/locator-state";

const OPTIONS = ["", "original", "zero", "extra"] as const;

describe("locator state", () => {
  it("GIVEN a supported product query WHEN state resolves THEN the slug survives", () => {
    expect(
      resolveLocatorSlug(OPTIONS, "https://example.test/uz/find/?product=zero"),
    ).toBe("zero");
  });

  it("GIVEN missing, empty, or unknown product queries WHEN state resolves THEN the range state wins", () => {
    expect(resolveLocatorSlug(OPTIONS, "https://example.test/uz/find/")).toBe(
      "",
    );
    expect(
      resolveLocatorSlug(
        OPTIONS,
        "https://example.test/uz/find/?product=unknown",
      ),
    ).toBe("");
    expect(
      resolveLocatorSlug(OPTIONS, "https://example.test/uz/find/?product="),
    ).toBe("");
  });

  it("GIVEN existing unrelated query data WHEN a locator URL changes THEN only product intent changes", () => {
    const selected = createLocatorUrl(
      "https://example.test/uz/find/?campaign=signal#route",
      "extra",
    );
    expect(selected.searchParams.get("campaign")).toBe("signal");
    expect(selected.searchParams.get("product")).toBe("extra");
    expect(selected.hash).toBe("#route");

    const cleared = createLocatorUrl(selected.href, "");
    expect(cleared.searchParams.has("product")).toBe(false);
    expect(cleared.searchParams.get("campaign")).toBe("signal");
  });

  it("GIVEN option, signal, and visual contracts WHEN sets match exactly THEN the contract is valid", () => {
    expect(
      hasMatchingLocatorSlugs(
        OPTIONS,
        ["original", "zero", "extra"],
        ["extra", "original", "zero"],
      ),
    ).toBe(true);
  });

  it("GIVEN duplicates, omissions, or empty product sets WHEN contracts validate THEN they fail closed", () => {
    expect(hasMatchingLocatorSlugs([""], [], [])).toBe(false);
    expect(
      hasMatchingLocatorSlugs(
        ["", "original", "original"],
        ["original"],
        ["original"],
      ),
    ).toBe(false);
    expect(
      hasMatchingLocatorSlugs(
        OPTIONS,
        ["original", "zero"],
        ["original", "zero", "extra"],
      ),
    ).toBe(false);
  });
});
