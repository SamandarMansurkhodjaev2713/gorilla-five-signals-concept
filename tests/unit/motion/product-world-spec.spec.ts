import { describe, expect, expectTypeOf, it } from "vitest";

import {
  PRODUCT_SLUGS,
  PRODUCT_WORLD_SPECS,
} from "@/features/product-detail/product-world-contract";
import {
  getProductWorldMotion,
  type ProductWorldEntryPose,
} from "@/motion/scene-setups/product-world-spec";

const NUMERIC_POSE_KEYS = [
  "x",
  "y",
  "rotate",
  "scale",
  "scaleX",
  "scaleY",
] as const;
const POSE_KEYS = [...NUMERIC_POSE_KEYS, "transformOrigin"] as const;
const ENTRY_ORIGINS = ["left center", "center center"] as const;
const TARGETS = ["field", "media"] as const;
const INVALID_SLUGS = ["", "unknown", "__proto__", "constructor"] as const;

function requireSpec(slug: string) {
  const spec = getProductWorldMotion(slug);
  if (spec === undefined)
    throw new Error(`Missing motion specification for ${slug}.`);
  return spec;
}

function poseDistance(
  pose: ProductWorldEntryPose,
  key: (typeof NUMERIC_POSE_KEYS)[number],
): number {
  const isScale = key.startsWith("scale");
  const identity = isScale ? 1 : 0;
  const value = pose[key] ?? (isScale ? pose.scale : undefined) ?? identity;
  return Math.abs(value - identity);
}

describe("product-world entry pose contract", () => {
  it("GIVEN the approved product range WHEN entry poses are read THEN they contain finite geometry rather than engine behavior", () => {
    for (const slug of PRODUCT_SLUGS) {
      const spec = requireSpec(slug);
      expect(spec.id).toBe(PRODUCT_WORLD_SPECS[slug].motionPath);
      for (const mode of [spec.full, spec.lite])
        for (const target of TARGETS) {
          const pose = mode[target];
          expect(
            Object.keys(pose).every((key) =>
              POSE_KEYS.some((allowed) => key === allowed),
            ),
          ).toBe(true);
          if (pose.transformOrigin !== undefined)
            expect(ENTRY_ORIGINS).toContain(pose.transformOrigin);
          for (const key of NUMERIC_POSE_KEYS) {
            const value = pose[key];
            if (value !== undefined) expect(Number.isFinite(value)).toBe(true);
            if (key.startsWith("scale") && value !== undefined)
              expect(value).toBeGreaterThan(0);
          }
        }
    }
  });

  it("GIVEN Full and Lite entry poses WHEN compared by transform component THEN Lite never exceeds Full displacement", () => {
    for (const slug of PRODUCT_SLUGS) {
      const spec = requireSpec(slug);
      for (const target of TARGETS)
        for (const key of NUMERIC_POSE_KEYS) {
          expect(poseDistance(spec.lite[target], key)).toBeLessThanOrEqual(
            poseDistance(spec.full[target], key),
          );
        }
    }
  });

  it("GIVEN invalid or prototype-like product identifiers WHEN looked up THEN no entry specification is returned", () => {
    for (const slug of INVALID_SLUGS)
      expect(getProductWorldMotion(slug)).toBeUndefined();
  });

  it("GIVEN the entry pose type WHEN engine behavior fields are considered THEN callbacks and timing remain outside its contract", () => {
    expectTypeOf<ProductWorldEntryPose>().not.toHaveProperty("onComplete");
    expectTypeOf<ProductWorldEntryPose>().not.toHaveProperty("duration");
    expectTypeOf<ProductWorldEntryPose>().not.toHaveProperty("ease");
  });
});
