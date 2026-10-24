import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@/config/site";
import { COMPARE_UI } from "@/features/compare/compare-ui";

const CONSUMER_SURFACES = [
  "src/features/compare/CompareArena.astro",
  "src/features/compare/CompareFallback.astro",
] as const;
const RETIRED_STYLE_MODULES = [
  "src/features/compare/compare-signal-readout.css",
  "src/features/compare/compare-signal-arena-responsive.css",
  "src/features/compare/compare-signal-instrument.css",
  "src/features/compare/compare-signal-responsive.css",
] as const;
const UNPUBLISHED_FACT_REFERENCE =
  /\b(?:copy\.verifiedPending|ui\.(?:sugar|composition|pending))\b/u;
const RETIRED_STYLE_SELECTOR =
  /\.(?:signal-channel__facts|verification-note)(?:\b|__)/u;

function assertConsumerFacts(source: string): void {
  if (UNPUBLISHED_FACT_REFERENCE.test(source)) {
    throw new Error(
      "Consumer comparison must not render unpublished fact placeholders.",
    );
  }
}

describe("consumer comparison content boundary", () => {
  it.each(CONSUMER_SURFACES)(
    "GIVEN %s WHEN its content contract is checked THEN approved product descriptions and native actions remain without pending fact rows",
    async (path) => {
      const source = await readFile(path, "utf8");
      expect(() => assertConsumerFacts(source)).not.toThrow();
      expect(source).toContain("products.map(");
      expect(source).toContain("product.name");
      expect(source).toContain('product.flavorNotes.join(" · ")');
      expect(source).toContain("product.description");
      expect(source).toContain(
        "href={localePath(locale, `/products/${product.slug}`)}",
      );
    },
  );

  it("GIVEN the all-product fallback WHEN its source is inspected THEN semantic comparison headers and product columns are retained", async () => {
    const source = await readFile(CONSUMER_SURFACES[1], "utf8");
    expect(source).toContain("data-compare-fallback");
    expect(source).toContain("data-compare-matrix");
    expect(source).toContain('scope="col"');
    expect(source).toContain("data-product-slug={product.slug}");
    expect(source).toContain("{ui.signal}");
    expect(source).toContain("{ui.overview}");
    expect(source).toContain("{copy.openDetails}");
  });

  it.each(SUPPORTED_LOCALES)(
    "GIVEN %s comparison copy WHEN the unused progress labels are removed THEN real action and recovery feedback stays localized",
    (locale) => {
      const copy = COMPARE_UI[locale];
      for (const key of ["sugar", "composition", "pending"]) {
        expect(copy).not.toHaveProperty(key);
      }
      for (const message of [
        copy.clear,
        copy.cleared,
        copy.copy,
        copy.copied,
        copy.copyFailed,
        copy.empty,
        copy.updated,
      ]) {
        expect(message.trim().length).toBeGreaterThan(0);
      }
    },
  );

  it.each(RETIRED_STYLE_MODULES)(
    "GIVEN %s WHEN retired markup has been removed THEN its unique unused styles are absent",
    async (path) => {
      expect(await readFile(path, "utf8")).not.toMatch(RETIRED_STYLE_SELECTOR);
    },
  );

  it("GIVEN an old pending fact row WHEN the contract is exercised THEN it rejects the placeholder rather than passing vacuously", () => {
    expect(() =>
      assertConsumerFacts("<dd>{copy.verifiedPending}</dd>"),
    ).toThrow("must not render unpublished fact placeholders");
    expect(() => assertConsumerFacts("<p>{ui.pending}</p>")).toThrow(
      "must not render unpublished fact placeholders",
    );
  });
});
