import type { MediaRecord } from "@/content/schema/media";
import type { ProductRecord } from "@/content/schema/product";
import type { LocalizedText } from "@/content/schema/shared";
import type { SourceRecord } from "@/content/schema/source";
import type {
  CultureRecord,
  FaqRecord,
  FlavorRecord,
  LegalRecord,
  StoreRecord,
} from "@/content/schema/support";

export function buildLocalizedText(value: string): LocalizedText {
  return {
    en: value,
    ru: value,
    uz: value,
  };
}

export function buildMediaRecord(
  overrides: Partial<MediaRecord> = {},
): MediaRecord {
  return {
    alt: buildLocalizedText("Gorilla Original can"),
    checksumSha256: "a".repeat(64),
    decorative: false,
    kind: "image",
    license: "Brand permission record",
    mediaId: "original-can",
    owner: "AION Beverages",
    path: "/media/generated/original-can.avif",
    permissionEvidence: "media-rights/original-can",
    territories: ["UZ"],
    ...overrides,
  };
}

export function buildProductRecord(): ProductRecord {
  const localized = buildLocalizedText("Original");
  return {
    canMediaId: "original-can",
    claims: [
      {
        claimId: "caffeine-original",
        market: "UZ",
        sourceId: "packaging-original",
        statement: localized,
        status: "brand-approved",
        unit: "mg-per-100ml",
        value: "32",
        verifiedAt: "2026-07-26",
        verifiedBy: "Project owner",
      },
    ],
    ctas: [{ href: "/uz/find", label: localized, type: "find" }],
    description: localized,
    flavorNotes: [localized],
    name: localized,
    posterMediaId: "original-poster",
    seo: {
      description: localized,
      title: localized,
    },
    sku: null,
    slug: "original",
    sourceId: "packaging-original",
    status: "draft",
    themeId: "original",
    warnings: [
      {
        sourceId: "legal-warning-uz",
        status: "legal-approved",
        text: localized,
        warningId: "energy-warning",
      },
    ],
  };
}

export function buildSourceRecord(): SourceRecord {
  return {
    evidencePath: "product-truth/original-can",
    kind: "uz-packaging",
    market: "UZ",
    reference: "Original Uzbekistan packaging",
    sourceId: "packaging-original",
    status: "brand-approved",
    title: "Original product packaging",
    verifiedAt: "2026-07-26",
    verifiedBy: "Project owner",
  };
}

export function buildFlavorRecord(): FlavorRecord {
  return {
    accentToken: "--color-original",
    flavorId: "original",
    name: buildLocalizedText("Original"),
    productSlug: "original",
    status: "draft",
  };
}

export function buildStoreRecord(): StoreRecord {
  return {
    address: buildLocalizedText("Tashkent"),
    coordinates: { latitude: 41.2995, longitude: 69.2401 },
    name: "Verified retailer",
    retailerUrl: "/uz/find",
    status: "verified",
    storeId: "tashkent-retailer",
    verifiedAt: "2026-07-26",
  };
}

export function buildCultureRecord(): CultureRecord {
  return {
    body: buildLocalizedText("Independent culture story"),
    mediaIds: ["culture-signal"],
    publishedAt: "2026-07-26",
    slug: "culture-signal",
    status: "draft",
    title: buildLocalizedText("Culture signal"),
  };
}

export function buildFaqRecord(): FaqRecord {
  return {
    answer: buildLocalizedText("Approved answer"),
    faqId: "product-faq",
    question: buildLocalizedText("Product question"),
    sourceIds: ["packaging-original"],
    status: "approved",
  };
}

export function buildLegalRecord(): LegalRecord {
  return {
    body: buildLocalizedText("Approved warning"),
    documentId: "energy-warning",
    effectiveAt: "2026-07-26",
    sourceId: "legal-warning-uz",
    status: "legal-approved",
    title: buildLocalizedText("Energy warning"),
  };
}
