import { describe, expect, it } from "vitest";

import { createHeroImageLayout } from "@/features/site/hero-image-layout";
import { HERO_CAN_ENVELOPE } from "@/motion/hero-can-spec";

const DEGREES_PER_HALF_TURN = 180;
const ROTATION_SAMPLES = 140;
const FLOAT_TOLERANCE = 1e-12;
const ASPECT_CASES = [
  { width: 640, height: 1666 },
  { width: 640, height: 640 },
  { width: 16400, height: 640 },
] as const;
const COMPACT_LANDSCAPE = "(max-width: 22rem) and (max-height: 45rem)";
const COMPACT_PORTRAIT = "(max-width: 22rem) min(";
const GENERAL_LANDSCAPE =
  "(max-height: 45rem) and (orientation: landscape) calc(";
const DESKTOP = "(min-width: 64rem)";
const TABLET = "(min-width: 48rem)";

describe("hero responsive image numerical contract", () => {
  it("GIVEN compact portrait art WHEN sizes is emitted THEN the 40svh hint preserves the separate wider-phone ceiling", () => {
    const { sizes, aspect } = createHeroImageLayout(ASPECT_CASES[0]);
    const compactStart = sizes.indexOf(COMPACT_PORTRAIT);
    const compactEnd = sizes.indexOf(GENERAL_LANDSCAPE, compactStart);
    expect(compactStart).toBeGreaterThanOrEqual(0);
    expect(compactEnd).toBeGreaterThan(compactStart);
    expect(sizes.slice(compactStart, compactEnd)).toContain("40svh");
    expect(sizes.slice(compactStart, compactEnd)).not.toContain("48svh");
    expect(
      sizes.endsWith(
        `min(calc(48svh * ${String(aspect)}), calc(25rem * ${String(aspect)}))`,
      ),
    ).toBe(true);
  });

  it.each(ASPECT_CASES)(
    "GIVEN native dimensions %j WHEN every authored rotation is projected THEN the width cap contains the image",
    (dimensions) => {
      const layout = createHeroImageLayout(dimensions);
      for (let sample = 0; sample <= ROTATION_SAMPLES; sample += 1) {
        const degrees =
          HERO_CAN_ENVELOPE.rotationDegrees *
          ((2 * sample) / ROTATION_SAMPLES - 1);
        const radians = (degrees * Math.PI) / DEGREES_PER_HALF_TURN;
        const projected =
          layout.aspect * Math.abs(Math.cos(radians)) +
          Math.abs(Math.sin(radians));
        expect(projected).toBeLessThanOrEqual(
          layout.projectedWidth + FLOAT_TOLERANCE,
        );
      }
    },
  );

  it("GIVEN a wide native image WHEN its maximum projection lies inside the rotation interval THEN an endpoint-only cap cannot pass", () => {
    const layout = createHeroImageLayout(ASPECT_CASES[2]);
    const maximumProjection = Math.hypot(layout.aspect, 1);
    expect(Math.abs(layout.projectedWidth - maximumProjection)).toBeLessThan(
      FLOAT_TOLERANCE,
    );
  });

  it("GIVEN intersecting responsive contexts WHEN sizes is emitted THEN the first matching branch has the correct priority", () => {
    const { sizes } = createHeroImageLayout(ASPECT_CASES[0]);
    expect(sizes.startsWith(COMPACT_LANDSCAPE)).toBe(true);
    const branches = [
      COMPACT_LANDSCAPE,
      COMPACT_PORTRAIT,
      GENERAL_LANDSCAPE,
      DESKTOP,
      TABLET,
    ];
    const positions: number[] = [];
    for (const branch of branches) {
      const afterPrevious = (positions.at(-1) ?? -1) + 1;
      positions.push(sizes.indexOf(branch, afterPrevious));
    }
    expect(positions.every((position) => position >= 0)).toBe(true);
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1] ?? -1);
    }
  });
});
