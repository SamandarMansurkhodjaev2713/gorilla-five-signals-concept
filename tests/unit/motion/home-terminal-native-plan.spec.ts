import { describe, expect, it } from "vitest";

import { NATIVE_MOTION_EASING } from "@/motion/native-easing";
import { createTerminalEntrancePlan } from "@/motion/scene-setups/home-terminal-native-plan";
import { createTerminalTargets } from "./home-terminal-native.fixture";

function maximumEnd(
  cues: ReturnType<typeof createTerminalEntrancePlan>,
): number {
  return Math.max(...cues.map((cue) => cue.delayMs + cue.durationMs));
}

function expectTimes(
  actual: readonly number[],
  expected: readonly number[],
): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    const expectedValue = expected[index];
    if (expectedValue === undefined) throw new Error("Missing expected time.");
    expect(value).toBeCloseTo(expectedValue);
  });
}

describe("terminal native entrance plan", () => {
  it("GIVEN Full motion WHEN its plan is created THEN all 21 authored targets preserve order, timing, and easing", () => {
    const targets = createTerminalTargets();
    const cues = createTerminalEntrancePlan({ targets, tier: "full" });

    expect(cues.map(({ target: cueTarget }) => cueTarget)).toEqual([
      ...targets.copy,
      targets.field,
      ...targets.trace,
      ...targets.nodes,
      targets.locator,
      ...targets.locatorSignals,
      ...targets.locatorCopy,
    ]);
    expectTimes(
      cues.map(({ delayMs }) => delayMs),
      [
        0, 55, 110, 165, 80, 240, 295, 350, 405, 360, 415, 470, 525, 580, 480,
        560, 615, 620, 675, 730, 785,
      ],
    );
    expectTimes(
      cues.map(({ durationMs }) => durationMs),
      [
        260, 260, 260, 260, 640, 260, 260, 260, 260, 160, 160, 160, 160, 160,
        640, 260, 260, 260, 260, 260, 260,
      ],
    );
    expect(cues.map(({ easing }) => easing)).toEqual([
      ...Array<string>(4).fill(NATIVE_MOTION_EASING.enter),
      NATIVE_MOTION_EASING.material,
      ...Array<string>(4).fill(NATIVE_MOTION_EASING.enter),
      ...Array<string>(5).fill(NATIVE_MOTION_EASING.snap),
      NATIVE_MOTION_EASING.material,
      ...Array<string>(6).fill(NATIVE_MOTION_EASING.enter),
    ]);
    expect(maximumEnd(cues)).toBe(1_120);
  });

  it("GIVEN Lite motion WHEN its plan is created THEN only the six authored lead and locator cues run for exactly 860ms", () => {
    const targets = createTerminalTargets();
    const cues = createTerminalEntrancePlan({ targets, tier: "lite" });

    expect(cues.map(({ target: cueTarget }) => cueTarget)).toEqual([
      ...targets.copy,
      targets.field,
      targets.locator,
    ]);
    expect(cues.map(({ role }) => role)).toEqual([
      "copy",
      "copy",
      "copy",
      "copy",
      "field",
      "locator",
    ]);
    expectTimes(
      cues.map(({ delayMs }) => delayMs),
      [0, 55, 110, 165, 80, 220],
    );
    expect(maximumEnd(cues)).toBe(860);
  });

  it("GIVEN the CSS-authored word opacity WHEN Full cues settle THEN native interpolation preserves its 0.42 baseline", () => {
    const targets = createTerminalTargets();
    const cues = createTerminalEntrancePlan({ targets, tier: "full" });
    const wordCue = cues.find(
      ({ target: cueTarget }) => cueTarget === targets.word,
    );
    const coordinateCue = cues.find(
      ({ target: cueTarget }) => cueTarget === targets.trace[1],
    );

    expect(wordCue?.frames).toEqual([{ opacity: 0 }, { opacity: 0.42 }]);
    expect(coordinateCue?.frames).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(cues[4]?.frames).toEqual([
      { clipPath: "inset(0 100% 0 0)", opacity: 0 },
      { clipPath: "inset(0 0 0 0)", opacity: 1 },
    ]);
    expect(cues[14]?.frames).toEqual([
      { clipPath: "inset(8% 8% 8% 8%)", opacity: 0 },
      { clipPath: "inset(0 0 0 0)", opacity: 1 },
    ]);
  });
});
