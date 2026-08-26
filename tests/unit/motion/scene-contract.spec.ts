import { describe, expect, it } from "vitest";

import { SCENE_DEFINITIONS } from "@/motion/scene-contract";
import { SCENE_SETUPS } from "@/motion/scene-setups";
import { setupProductDetailWorld } from "@/motion/scene-setups/product-detail-world-motion";
import { getProductWorldMotion } from "@/motion/scene-setups/product-world-spec";

describe("product scene contracts", () => {
  it("GIVEN overview and detail compositions WHEN scene contracts resolve THEN only product-world receives physical-world motion", () => {
    const productLab = SCENE_DEFINITIONS.find(
      (definition) => definition.id === "product-lab",
    );
    const productWorld = SCENE_DEFINITIONS.find(
      (definition) => definition.id === "product-world",
    );

    expect(productLab?.selector).toBe('[data-motion-scene="product-lab"]');
    expect(productWorld?.selector).toBe('[data-motion-scene="product-world"]');
    expect(SCENE_SETUPS["product-lab"]).not.toBe(setupProductDetailWorld);
    expect(SCENE_SETUPS["product-world"]).toBe(setupProductDetailWorld);
  });

  it("GIVEN an absent or unknown product slug WHEN its motion spec resolves THEN no fallback world is selected", () => {
    expect(getProductWorldMotion("")).toBeUndefined();
    expect(getProductWorldMotion("unknown-product")).toBeUndefined();
  });
});
