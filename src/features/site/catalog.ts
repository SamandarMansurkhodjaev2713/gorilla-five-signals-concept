import { getCollection, type CollectionEntry } from "astro:content";

import type { SupportedLocale } from "@/config/site";

import { withBasePath } from "./base-path";
import { localize } from "./localization";

export type ProductEntry = CollectionEntry<"products">;
export type MediaEntry = CollectionEntry<"media">;

export type ProductView = Readonly<{
  alt: string;
  description: string;
  flavorNotes: readonly string[];
  findLabel: string;
  height: number;
  imagePath: string;
  imageSrcSet: string;
  name: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  sku: string | null;
  sourceId: string;
  warningText: string;
  width: number;
}>;

const MEDIA_DIMENSIONS = new Map<
  string,
  Readonly<{ height: number; width: number }>
>([
  ["media-can-original", { height: 1666, width: 640 }],
  ["media-can-zero", { height: 1646, width: 640 }],
  ["media-can-extra", { height: 1675, width: 640 }],
  ["media-can-mango-coconut", { height: 1675, width: 640 }],
  ["media-can-lychee-pear", { height: 1666, width: 640 }],
]);

const PRODUCT_ORDER = new Map<string, number>([
  ["original", 0],
  ["zero", 1],
  ["extra", 2],
  ["mango-coconut", 3],
  ["lychee-pear", 4],
]);
const RESPONSIVE_IMAGE_WIDTHS = [320, 480] as const;
const RESPONSIBLE_WARNING_ID = "responsible-use";
const FIND_CTA_TYPE = "find";

function requireUnique<Item>(
  items: readonly Item[],
  predicate: (item: Item) => boolean,
  description: string,
): Item {
  const matches = items.filter(predicate);
  if (matches.length !== 1 || matches[0] === undefined) {
    throw new Error(`Expected exactly one ${description}.`);
  }
  return matches[0];
}

export async function getApprovedProducts(
  locale: SupportedLocale,
): Promise<readonly ProductView[]> {
  const [products, media] = await Promise.all([
    getCollection("products", ({ data }) => data.status === "approved"),
    getCollection("media"),
  ]);
  const mediaById = new Map(media.map((entry) => [entry.data.mediaId, entry]));

  return products
    .toSorted(
      (left, right) =>
        getProductOrder(left.data.slug) - getProductOrder(right.data.slug),
    )
    .map((entry) => createProductView(entry, mediaById, locale));
}

export async function getProductBySlug(
  slug: string,
  locale: SupportedLocale,
): Promise<ProductView | undefined> {
  const products = await getApprovedProducts(locale);
  return products.find((product) => product.slug === slug);
}

function getProductOrder(slug: string): number {
  const order = PRODUCT_ORDER.get(slug);
  if (order === undefined) {
    throw new Error(`Missing display order for ${slug}.`);
  }
  return order;
}

function createProductView(
  record: ProductEntry,
  mediaById: ReadonlyMap<string, MediaEntry>,
  locale: SupportedLocale,
): ProductView {
  const media = mediaById.get(record.data.canMediaId);
  if (media?.data.alt === null || media === undefined) {
    throw new Error(`Missing meaningful can media for ${record.data.slug}.`);
  }
  const dimensions = MEDIA_DIMENSIONS.get(media.data.mediaId);
  if (dimensions === undefined) {
    throw new Error(`Missing native dimensions for ${media.data.mediaId}.`);
  }
  const warning = requireUnique(
    record.data.warnings,
    (item) => item.warningId === RESPONSIBLE_WARNING_ID,
    `${RESPONSIBLE_WARNING_ID} warning for ${record.data.slug}`,
  );
  const findCta = requireUnique(
    record.data.ctas,
    (item) => item.type === FIND_CTA_TYPE,
    `${FIND_CTA_TYPE} CTA for ${record.data.slug}`,
  );

  return {
    alt: localize(media.data.alt, locale),
    description: localize(record.data.description, locale),
    flavorNotes: record.data.flavorNotes.map((note) => localize(note, locale)),
    findLabel: localize(findCta.label, locale),
    height: dimensions.height,
    imagePath: withBasePath(media.data.path),
    imageSrcSet: createImageSrcSet(
      withBasePath(media.data.path),
      dimensions.width,
    ),
    name: localize(record.data.name, locale),
    seoDescription: localize(record.data.seo.description, locale),
    seoTitle: localize(record.data.seo.title, locale),
    slug: record.data.slug,
    sku: record.data.sku,
    sourceId: record.data.sourceId,
    warningText: localize(warning.text, locale),
    width: dimensions.width,
  };
}

function createImageSrcSet(imagePath: string, nativeWidth: number): string {
  const responsiveSources = RESPONSIVE_IMAGE_WIDTHS.map(
    (width) =>
      `${imagePath.replace(/\.webp$/u, `-${String(width)}.webp`)} ${String(width)}w`,
  );
  return [...responsiveSources, `${imagePath} ${String(nativeWidth)}w`].join(
    ", ",
  );
}
