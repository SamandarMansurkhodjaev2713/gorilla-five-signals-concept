import { describe, expect, it } from "vitest";

import { gsap } from "gsap";

import {
  REACTOR_NATIVE_EASING,
  type ReactorEase,
} from "@/features/flavor-reactor/native/reactor-easing";
import { MOTION_EASE } from "@/motion/tokens";

interface LinearStop {
  readonly input: number;
  readonly output: number;
}

const REACTOR_EASES: readonly ReactorEase[] = ["enter", "material", "snap"];
const DENSE_SAMPLE_INTERVALS = 8_192;
const MAX_OPACITY_ERROR = 0.002;
const MAX_PRODUCT_TRAVEL_ERROR_PX = 0.25;
const MAX_ROTATION_ERROR_DEGREES = 0.1;
const PRODUCT_TRAVEL_PX = 136;
const ROTATION_DEGREES = 32;
const WIDE_CLIP_EDGE_PX = 3_840;
const MAX_CLIP_EDGE_ERROR_PX = 0.25;
const GSAP_EASE_NAMES: Readonly<Record<ReactorEase, string>> = Object.freeze({
  enter: MOTION_EASE.enter,
  material: MOTION_EASE.material,
  snap: MOTION_EASE.snap,
});

function parseStop(serialized: string): LinearStop {
  const [outputText, inputText, extra] = serialized.trim().split(/\s+/u);
  if (
    outputText === undefined ||
    inputText === undefined ||
    extra !== undefined ||
    !inputText.endsWith("%")
  ) {
    throw new Error(`Invalid CSS linear stop: ${serialized}`);
  }
  const output = Number(outputText);
  const input = Number(inputText.slice(0, -1)) / 100;
  if (!Number.isFinite(output) || !Number.isFinite(input)) {
    throw new Error(`Non-finite CSS linear stop: ${serialized}`);
  }
  return { input, output };
}

function parseLinear(serialized: string): readonly LinearStop[] {
  const prefix = "linear(";
  if (!serialized.startsWith(prefix) || !serialized.endsWith(")")) {
    throw new Error(`Invalid CSS linear easing: ${serialized}`);
  }
  return serialized.slice(prefix.length, -1).split(",").map(parseStop);
}

function interpolate(stops: readonly LinearStop[], progress: number): number {
  const upperIndex = stops.findIndex(({ input }) => input >= progress);
  if (upperIndex <= 0) return stops[0]?.output ?? Number.NaN;
  const lower = stops[upperIndex - 1];
  const upper = stops[upperIndex];
  if (lower === undefined || upper === undefined) return Number.NaN;
  const interval = upper.input - lower.input;
  const ratio = interval === 0 ? 0 : (progress - lower.input) / interval;
  return lower.output + (upper.output - lower.output) * ratio;
}

function maximumError(
  stops: readonly LinearStop[],
  reference: (progress: number) => number,
): number {
  let maximum = 0;
  for (let index = 0; index <= DENSE_SAMPLE_INTERVALS; index += 1) {
    const progress = index / DENSE_SAMPLE_INTERVALS;
    maximum = Math.max(
      maximum,
      Math.abs(interpolate(stops, progress) - reference(progress)),
    );
  }
  return maximum;
}

describe("reactor native easing", () => {
  it("GIVEN generated native curves WHEN their CSS stops are parsed THEN values are finite, normalized, ordered, and endpoint exact", () => {
    expect(Object.isFrozen(REACTOR_NATIVE_EASING)).toBe(true);

    for (const role of REACTOR_EASES) {
      const stops = parseLinear(REACTOR_NATIVE_EASING[role]);
      expect(stops.length).toBeGreaterThan(2);
      expect(stops.length).toBeLessThanOrEqual(513);
      expect(stops[0]).toEqual({ input: 0, output: 0 });
      expect(stops.at(-1)).toEqual({ input: 1, output: 1 });
      expect(
        stops.every(
          ({ input, output }, index) =>
            Number.isFinite(input) &&
            Number.isFinite(output) &&
            (index === 0 || input > (stops[index - 1]?.input ?? input)),
        ),
      ).toBe(true);
    }
  });

  it("GIVEN installed GSAP 3.15 eases WHEN generated curves are densely interpolated THEN opacity, travel, rotation and wide clip errors stay within budget", () => {
    for (const role of REACTOR_EASES) {
      const parsedEase = gsap.parseEase(GSAP_EASE_NAMES[role]);
      const error = maximumError(
        parseLinear(REACTOR_NATIVE_EASING[role]),
        parsedEase,
      );

      expect(error, `${role} opacity error`).toBeLessThan(MAX_OPACITY_ERROR);
      expect(
        PRODUCT_TRAVEL_PX * error,
        `${role} product travel error`,
      ).toBeLessThan(MAX_PRODUCT_TRAVEL_ERROR_PX);
      expect(ROTATION_DEGREES * error, `${role} rotation error`).toBeLessThan(
        MAX_ROTATION_ERROR_DEGREES,
      );
      expect(WIDE_CLIP_EDGE_PX * error, `${role} wide clip error`).toBeLessThan(
        MAX_CLIP_EDGE_ERROR_PX,
      );
    }
  });
});
