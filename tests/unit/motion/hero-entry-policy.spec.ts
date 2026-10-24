import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  HERO_CAN_COMPACT_ENTRY_SPEC,
  HERO_CAN_ENTRY_SPEC,
  HERO_CAN_ENVELOPE,
  HERO_COMPACT_MEDIA_QUERY,
  resolveHeroCanEntrySpec,
} from "@/motion/hero-can-spec";
import { MOTION_DURATION_SECONDS } from "@/motion/tokens";

const MINIMUM_FOCAL_SECONDS = 0.5;
const MAXIMUM_LITE_FOCAL_SECONDS = 0.7;

describe("authored compact hero entry policy", () => {
  it("GIVEN the compact native media condition WHEN entry resolves THEN travel and tilt use the compact shared contract", () => {
    expect(HERO_COMPACT_MEDIA_QUERY).toBe("(max-width: 22rem)");
    expect(resolveHeroCanEntrySpec({ compact: true })).toBe(
      HERO_CAN_COMPACT_ENTRY_SPEC,
    );
    expect(HERO_CAN_COMPACT_ENTRY_SPEC.travelY).toBe(32);
    expect(HERO_CAN_COMPACT_ENTRY_SPEC.rotationDegrees).toBe(-3);
    expect(HERO_CAN_COMPACT_ENTRY_SPEC.scale).toBe(0.92);
    expect(HERO_CAN_COMPACT_ENTRY_SPEC.restRotationDegrees).toBe(
      HERO_CAN_ENTRY_SPEC.restRotationDegrees,
    );
  });

  it("GIVEN a noncompact native media condition WHEN entry resolves THEN the original desktop entry remains unchanged", () => {
    expect(resolveHeroCanEntrySpec({ compact: false })).toBe(
      HERO_CAN_ENTRY_SPEC,
    );
    expect(HERO_CAN_ENTRY_SPEC.travelY).toBe(112);
    expect(HERO_CAN_ENVELOPE.rotationDegrees).toBeGreaterThanOrEqual(
      Math.abs(HERO_CAN_COMPACT_ENTRY_SPEC.rotationDegrees),
    );
    expect(HERO_CAN_ENVELOPE.scale).toBeGreaterThanOrEqual(
      HERO_CAN_COMPACT_ENTRY_SPEC.scale,
    );
  });

  it("GIVEN Lite focal choreography WHEN its duration is selected THEN the finite natural sequence stays within the authored short entrance range", () => {
    expect(MOTION_DURATION_SECONDS.scene).toBeGreaterThanOrEqual(
      MINIMUM_FOCAL_SECONDS,
    );
    expect(MOTION_DURATION_SECONDS.scene).toBeLessThanOrEqual(
      MAXIMUM_LITE_FOCAL_SECONDS,
    );
  });

  it("GIVEN touch Lite and Reduced WHEN setup source is inspected THEN Lite gains its own focal path without desktop pointer or ghost hooks", async () => {
    const [hero, lite] = await Promise.all([
      readFile("src/motion/scene-setups/hero.ts", "utf8"),
      readFile("src/motion/scene-setups/hero-lite.ts", "utf8"),
    ]);
    expect(hero).toContain('context.capability.kind === "reduced"');
    expect(hero).toContain("animateLiteSignalBoot(context)");
    expect(lite).toContain("HERO_CAN_COMPACT_ENTRY_SPEC.travelY");
    expect(lite).not.toContain("[data-hero-ghost]");
    expect(lite).not.toContain("[data-motion-hero-frequency]");
    expect(lite).not.toContain("pointermove");
  });

  it("GIVEN a product-world entrance WHEN scroll ownership is registered THEN only the natural completion callback can create it", async () => {
    const source = await readFile(
      "src/motion/scene-setups/product-detail-world-motion.ts",
      "utf8",
    );
    const setup = source.slice(
      source.indexOf("export const setupProductDetailWorld"),
    );
    expect(setup).not.toContain("createHeroScrub(");
    const completion = source.slice(
      source.indexOf("timeline.call"),
      source.indexOf("function scrubTo"),
    );
    expect(completion).toContain("if (context.signal.aborted) return;");
    expect(completion.replace(/\s+/gu, " ")).toContain(
      "context.runOwned((): void => createHeroScrub(context, hero, spec))",
    );
    expect(setup).toContain("animateHero(context, hero, spec)");
  });
});
