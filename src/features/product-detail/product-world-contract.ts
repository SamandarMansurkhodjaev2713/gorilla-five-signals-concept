export const PRODUCT_SLUGS = [
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export type ProductTitleScale = "standard" | "compact" | "extended";

export interface ProductWorldSpec {
  readonly geometry:
    | "axis-split"
    | "lateral-chamber"
    | "forward-overdrive"
    | "diagonal-collision"
    | "prismatic-lens";
  readonly material:
    | "wet-aluminum"
    | "silver-condensation"
    | "petrol-metal"
    | "fiber-vapor"
    | "droplet-refraction";
  readonly motionPath:
    | "rupture-strike"
    | "frequency-lock"
    | "axial-overdrive"
    | "temperature-collision"
    | "prismatic-orbit";
  readonly slug: ProductSlug;
}

export const PRODUCT_WORLD_SPECS: Readonly<
  Record<ProductSlug, ProductWorldSpec>
> = Object.freeze({
  original: {
    geometry: "axis-split",
    material: "wet-aluminum",
    motionPath: "rupture-strike",
    slug: "original",
  },
  zero: {
    geometry: "lateral-chamber",
    material: "silver-condensation",
    motionPath: "frequency-lock",
    slug: "zero",
  },
  extra: {
    geometry: "forward-overdrive",
    material: "petrol-metal",
    motionPath: "axial-overdrive",
    slug: "extra",
  },
  "mango-coconut": {
    geometry: "diagonal-collision",
    material: "fiber-vapor",
    motionPath: "temperature-collision",
    slug: "mango-coconut",
  },
  "lychee-pear": {
    geometry: "prismatic-lens",
    material: "droplet-refraction",
    motionPath: "prismatic-orbit",
    slug: "lychee-pear",
  },
});

export function isProductSlug(value: string): value is ProductSlug {
  return PRODUCT_SLUGS.some((slug) => slug === value);
}

export function requireProductSlug(value: string): ProductSlug {
  if (!isProductSlug(value)) {
    throw new Error(`Unsupported product world: ${value}.`);
  }
  return value;
}

function longestTitleSegment(value: string): number {
  return value
    .split(/[-–—·\s]/u)
    .map((segment) => Array.from(segment).length)
    .reduce((longest, length) => Math.max(longest, length), 0);
}

export function productTitleScale(name: string): ProductTitleScale {
  const longestSegment = longestTitleSegment(name);
  if (longestSegment >= 8) {
    return "extended";
  }
  if (longestSegment >= 6) {
    return "compact";
  }
  return "standard";
}
