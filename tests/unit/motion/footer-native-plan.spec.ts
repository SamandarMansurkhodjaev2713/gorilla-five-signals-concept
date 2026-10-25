import { describe, expect, it } from "vitest";

import { NATIVE_MOTION_EASING } from "@/motion/native-easing";
import { createFooterEntrancePlan } from "@/motion/scene-setups/footer-native-plan";
import { createFooterSignals } from "./footer-native.fixture";

describe("footer native entrance plan", () => {
  it("GIVEN six signal rails WHEN planned THEN order, exact schedule, easing, and rest pose match the authored GSAP sequence", () => {
    const signals = createFooterSignals();
    const cues = createFooterEntrancePlan(signals);

    expect(cues.map(({ target }) => target)).toEqual(signals);
    expect(cues.map(({ delayMs }) => delayMs)).toEqual([
      0, 40, 80, 120, 160, 200,
    ]);
    expect(cues.map(({ durationMs }) => durationMs)).toEqual(
      Array<number>(6).fill(260),
    );
    expect(cues.map(({ easing }) => easing)).toEqual(
      Array<string>(6).fill(NATIVE_MOTION_EASING.snap),
    );
    expect(cues.at(-1)?.delayMs).toBe(200);
    expect(
      Math.max(...cues.map(({ delayMs, durationMs }) => delayMs + durationMs)),
    ).toBe(460);
    expect(cues.every(({ role }) => role === "signal")).toBe(true);
    expect(
      cues.every(({ frames }) => frames.at(-1)?.transform === "scaleX(1)"),
    ).toBe(true);
  });

  it("GIVEN no signal targets WHEN planned THEN the finite plan stays empty", () => {
    expect(createFooterEntrancePlan([])).toEqual([]);
  });
});
