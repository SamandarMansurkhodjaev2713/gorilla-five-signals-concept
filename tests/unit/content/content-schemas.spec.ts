import { describe, expect, it } from "vitest";

import { mediaSchema } from "@/content/schema/media";
import { productSchema } from "@/content/schema/product";
import { sourceSchema } from "@/content/schema/source";
import {
  cultureSchema,
  faqSchema,
  flavorSchema,
  legalSchema,
  storeSchema,
} from "@/content/schema/support";

import {
  buildCultureRecord,
  buildFaqRecord,
  buildFlavorRecord,
  buildLegalRecord,
  buildLocalizedText,
  buildMediaRecord,
  buildProductRecord,
  buildSourceRecord,
  buildStoreRecord,
} from "../../fixtures/content";

describe("mediaSchema", () => {
  it("GIVEN approved meaningful media WHEN parsed THEN provenance is retained", () => {
    expect(mediaSchema.parse(buildMediaRecord()).mediaId).toBe("original-can");
  });

  it("GIVEN meaningful media without alt WHEN parsed THEN validation fails", () => {
    expect(() => mediaSchema.parse(buildMediaRecord({ alt: null }))).toThrow();
  });

  it("GIVEN decorative media with descriptive alt WHEN parsed THEN validation fails", () => {
    expect(() =>
      mediaSchema.parse(buildMediaRecord({ decorative: true })),
    ).toThrow();
  });

  it("GIVEN media without UZ rights WHEN parsed THEN validation fails", () => {
    expect(() =>
      mediaSchema.parse(buildMediaRecord({ territories: ["KZ"] })),
    ).toThrow();
  });
});

describe("productSchema", () => {
  it("GIVEN a source-backed product WHEN parsed THEN stable identity is retained", () => {
    expect(productSchema.parse(buildProductRecord()).slug).toBe("original");
  });

  it("GIVEN an unapproved claim WHEN parsed THEN validation fails", () => {
    const product = buildProductRecord();
    const claim = product.claims[0];
    expect(claim).toBeDefined();

    expect(() =>
      productSchema.parse({
        ...product,
        claims: [{ ...claim, status: "draft" }],
      }),
    ).toThrow();
  });

  it("GIVEN incomplete localization WHEN parsed THEN validation fails", () => {
    expect(() =>
      productSchema.parse({
        ...buildProductRecord(),
        name: { en: "Original", uz: "Original" },
      }),
    ).toThrow();
  });

  it("GIVEN a protocol-relative CTA WHEN parsed THEN validation fails", () => {
    const product = buildProductRecord();
    expect(() =>
      productSchema.parse({
        ...product,
        ctas: [{ ...product.ctas[0], href: "//unsafe.example.com" }],
      }),
    ).toThrow();
  });

  it("GIVEN localized copy WHEN built THEN all required locales exist", () => {
    expect(Object.keys(buildLocalizedText("Signal")).sort()).toEqual([
      "en",
      "ru",
      "uz",
    ]);
  });
});

describe("supporting content schemas", () => {
  it("GIVEN a verified source WHEN parsed THEN its market stays constrained", () => {
    expect(sourceSchema.parse(buildSourceRecord()).market).toBe("UZ");
  });

  it("GIVEN a flavor record WHEN parsed THEN its product relation is retained", () => {
    expect(flavorSchema.parse(buildFlavorRecord()).productSlug).toBe(
      "original",
    );
  });

  it("GIVEN a verified store WHEN parsed THEN valid coordinates are retained", () => {
    expect(storeSchema.parse(buildStoreRecord()).coordinates.latitude).toBe(
      41.2995,
    );
  });

  it("GIVEN an impossible latitude WHEN parsed THEN validation fails", () => {
    const store = buildStoreRecord();
    expect(() =>
      storeSchema.parse({
        ...store,
        coordinates: { ...store.coordinates, latitude: 91 },
      }),
    ).toThrow();
  });

  it("GIVEN culture, FAQ, and legal records WHEN parsed THEN each contract accepts them", () => {
    expect(cultureSchema.parse(buildCultureRecord()).slug).toBe(
      "culture-signal",
    );
    expect(faqSchema.parse(buildFaqRecord()).faqId).toBe("product-faq");
    expect(legalSchema.parse(buildLegalRecord()).documentId).toBe(
      "energy-warning",
    );
  });
});
