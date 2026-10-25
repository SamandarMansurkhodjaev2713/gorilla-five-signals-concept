import {
  isProductSlug,
  type ProductSlug,
} from "@/features/product-detail/product-world-contract";

import type { SceneSetupContext } from "../create-scene";

type TweenVars = Parameters<SceneSetupContext["gsap"]["to"]>[1];

/** Entry configuration describes poses, never engine callbacks or playback timing. */
export interface ProductWorldEntryPose {
  readonly x?: number;
  readonly y?: number;
  readonly rotate?: number;
  readonly scale?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly transformOrigin?: "left center" | "center center";
}

interface ProductWorldEntrySpec {
  readonly field: ProductWorldEntryPose;
  readonly media: ProductWorldEntryPose;
}

interface ProductWorldScrollSpec {
  readonly field: TweenVars;
  readonly media: TweenVars;
}

export interface ProductWorldMotionSpec {
  readonly full: ProductWorldEntrySpec;
  readonly id:
    | "rupture-strike"
    | "frequency-lock"
    | "axial-overdrive"
    | "temperature-collision"
    | "prismatic-orbit";
  readonly lite: ProductWorldEntrySpec;
  readonly scroll: ProductWorldScrollSpec;
}

const WORLD_MOTION: Readonly<Record<ProductSlug, ProductWorldMotionSpec>> = {
  original: {
    full: {
      field: { scaleX: 0.94, transformOrigin: "left center", x: -36 },
      media: { rotate: 5, scale: 0.97, x: 32 },
    },
    id: "rupture-strike",
    lite: { field: { scaleX: 0.98, x: -18 }, media: { rotate: 2, x: 16 } },
    scroll: {
      field: { xPercent: -4 },
      media: { rotate: -2, xPercent: -7, yPercent: -5 },
    },
  },
  zero: {
    full: { field: { rotate: 4, scale: 0.96 }, media: { scaleY: 0.96, y: 28 } },
    id: "frequency-lock",
    lite: { field: { rotate: 2 }, media: { scaleY: 0.98, y: 14 } },
    scroll: { field: { rotate: 3 }, media: { scale: 0.98, yPercent: -7 } },
  },
  extra: {
    full: {
      field: { rotate: -3, scale: 1.04 },
      media: { scale: 1.04, y: -28 },
    },
    id: "axial-overdrive",
    lite: { field: { scale: 1.02 }, media: { scale: 1.02, y: -14 } },
    scroll: { field: { scale: 1.06 }, media: { scale: 1.03, yPercent: -10 } },
  },
  "mango-coconut": {
    full: { field: { scaleX: 0.95, x: -34 }, media: { rotate: -5, x: 30 } },
    id: "temperature-collision",
    lite: { field: { scaleX: 0.98, x: -17 }, media: { rotate: -2, x: 15 } },
    scroll: {
      field: { xPercent: -5 },
      media: { rotate: -1.5, xPercent: -6, yPercent: -4 },
    },
  },
  "lychee-pear": {
    full: { field: { rotate: 7, scale: 1.03 }, media: { rotate: 5, x: -30 } },
    id: "prismatic-orbit",
    lite: { field: { rotate: 3, scale: 1.01 }, media: { rotate: 2, x: -15 } },
    scroll: {
      field: { rotate: 7 },
      media: { rotate: 1.5, xPercent: 4, yPercent: -5 },
    },
  },
};

export function getProductWorldMotion(
  slug: string,
): ProductWorldMotionSpec | undefined {
  return isProductSlug(slug) ? WORLD_MOTION[slug] : undefined;
}
