import { describe, expect, it } from "vitest";

import {
  localePath,
  localize,
  replaceLocale,
} from "@/features/site/localization";

describe("localization routing", () => {
  it("GIVEN a localized value WHEN a locale is selected THEN the matching text is returned", () => {
    expect(localize({ en: "Find", ru: "Найти", uz: "Topish" }, "uz")).toBe(
      "Topish",
    );
  });

  it("GIVEN root and nested paths WHEN localized THEN separators remain canonical", () => {
    expect(localePath("uz")).toBe("/uz/");
    expect(localePath("ru", "products/original")).toBe(
      "/ru/products/original/",
    );
    expect(localePath("en", "/find")).toBe("/en/find/");
  });

  it("GIVEN a localized product path WHEN locale changes THEN the complete suffix is preserved", () => {
    expect(replaceLocale("/uz/products/mango-coconut", "ru")).toBe(
      "/ru/products/mango-coconut/",
    );
    expect(replaceLocale("/uz/?product=zero", "en")).toBe("/en/?product=zero");
  });
});
