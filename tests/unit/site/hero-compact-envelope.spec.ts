import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  createHeroImageLayout,
  HERO_GUTTER_EXPRESSION,
} from "@/features/site/hero-image-layout";
import { HERO_CAN_ENTRY_SPEC, HERO_CAN_ENVELOPE } from "@/motion/hero-can-spec";

const NATIVE_DIMENSIONS = Object.freeze({ width: 640, height: 1666 });
const INVALID_DIMENSIONS = [
  { width: 0, height: 1666 },
  { width: -1, height: 1666 },
  { width: 640, height: 0 },
  { width: 640, height: Number.NaN },
  { width: Number.POSITIVE_INFINITY, height: 1666 },
  { width: 1.5, height: 1666 },
] as const;

describe("compact hero native framing contract", () => {
  it("GIVEN authored motion WHEN framing is derived THEN actual entry and rest use the shared specification", async () => {
    const [hero, product, compact, markup] = await Promise.all([
      readFile("src/motion/scene-setups/hero-full-boot.ts", "utf8"),
      readFile("src/components/home/home-hero-product.css", "utf8"),
      readFile("src/components/home/home-hero-compact.css", "utf8"),
      readFile("src/components/home/HomeHero.astro", "utf8"),
    ]);
    expect(hero).toContain("resolveHeroCanEntrySpec");
    expect(hero).toContain("rotate: entry.rotationDegrees");
    expect(hero).toContain("scale: entry.scale");
    expect(hero).toContain("y: entry.travelY");
    expect(markup).toContain("HERO_CAN_COMPACT_ENTRY_SPEC.travelY");
    expect(compact).toContain("--hero-can-entry-travel-compact");
    expect(product).toContain("rotate(var(--hero-can-rest-rotation))");
    expect(markup).toContain("HERO_CAN_ENTRY_SPEC.restRotationDegrees");
    expect(compact.replace(/\s+/gu, " ")).toContain(
      "inline-size: calc( var(--hero-can-height) * var(--hero-primary-aspect-ratio) );",
    );
    expect(HERO_CAN_ENVELOPE.rotationDegrees).toBeGreaterThanOrEqual(
      Math.abs(HERO_CAN_ENTRY_SPEC.rotationDegrees),
    );
    expect(HERO_CAN_ENVELOPE.scale).toBeGreaterThan(1);
  });

  it("GIVEN source spacing tokens WHEN sizes is emitted THEN the exact gutter expression stays synchronized", async () => {
    const tokens = await readFile("src/styles/tokens.css", "utf8");
    expect(/--space-gutter:\s*([^;]+);/u.exec(tokens)?.[1]).toBe(
      HERO_GUTTER_EXPRESSION,
    );
  });

  it("GIVEN native product dimensions WHEN sizes is generated THEN compact and general landscape precede regular branches", () => {
    const layout = createHeroImageLayout(NATIVE_DIMENSIONS);
    expect(layout.aspect).toBe(
      NATIVE_DIMENSIONS.width / NATIVE_DIMENSIONS.height,
    );
    expect(layout.projectedWidth).toBeGreaterThan(layout.aspect);
    expect(layout.sizes).toContain(
      "(max-height: 45rem) and (orientation: landscape)",
    );
    expect(layout.sizes).toContain("calc(28rem * ");
    expect(layout.sizes).toContain(HERO_GUTTER_EXPRESSION);
  });

  it.each(INVALID_DIMENSIONS)(
    "GIVEN invalid dimensions %j WHEN sizes is generated THEN it fails closed",
    (dimensions) => {
      expect(() => createHeroImageLayout(dimensions)).toThrow(
        "positive, safe native pixel dimensions",
      );
    },
  );
});
