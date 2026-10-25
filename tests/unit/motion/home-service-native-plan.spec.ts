import { describe, expect, it } from "vitest";

import { NATIVE_MOTION_EASING } from "@/motion/native-easing";
import { createHomeServicePlan } from "@/motion/scene-setups/home-service-native-plan";
import { createHomeServiceTargets } from "./home-service-native.fixture";

function maximumEnd(cues: ReturnType<typeof createHomeServicePlan>): number {
  return Math.max(...cues.map((cue) => cue.delayMs + cue.durationMs));
}

describe("home-service native entrance plan", () => {
  it("GIVEN Full motion WHEN planned THEN all 12 targets preserve authored order, timing, easing, and rest opacity", () => {
    const targets = createHomeServiceTargets();
    const cues = createHomeServicePlan({ targets, tier: "full" });

    expect(cues.map(({ target }) => target)).toEqual([
      targets.header,
      ...targets.rows,
      targets.action,
      targets.contact,
      targets.contactWord,
      ...targets.contactCopy,
    ]);
    expect(cues.map(({ delayMs }) => delayMs)).toEqual([
      0, 120, 175, 230, 260, 300, 360, 440, 495, 550, 605, 660,
    ]);
    expect(cues.map(({ durationMs }) => durationMs)).toEqual([
      640, 260, 260, 260, 260, 640, 640, 260, 260, 260, 260, 260,
    ]);
    expect(cues.map(({ easing }) => easing)).toEqual([
      ...Array<string>(5).fill(NATIVE_MOTION_EASING.enter),
      NATIVE_MOTION_EASING.material,
      NATIVE_MOTION_EASING.material,
      ...Array<string>(5).fill(NATIVE_MOTION_EASING.enter),
    ]);
    expect(cues.every(({ frames }) => frames.at(-1)?.opacity === 1)).toBe(true);
    expect(maximumEnd(cues)).toBe(1_000);
  });

  it("GIVEN Lite motion WHEN planned THEN Full-only word and copy are excluded and the handoff ends at 940ms", () => {
    const targets = createHomeServiceTargets();
    const cues = createHomeServicePlan({ targets, tier: "lite" });

    expect(cues.map(({ target }) => target)).toEqual([
      targets.header,
      ...targets.rows,
      targets.action,
      targets.contact,
    ]);
    expect(cues.map(({ role }) => role)).toEqual([
      "header",
      "row",
      "row",
      "row",
      "action",
      "contact",
    ]);
    expect(maximumEnd(cues)).toBe(940);
  });

  it("GIVEN reveal cues WHEN inspected THEN each authored mask settles to the CSS rest clip", () => {
    const cues = createHomeServicePlan({
      targets: createHomeServiceTargets(),
      tier: "full",
    });

    expect(cues[0]?.frames).toEqual([
      { clipPath: "inset(0 0 100% 0)", opacity: 0 },
      { clipPath: "inset(0 0 0 0)", opacity: 1 },
    ]);
    expect(cues[1]?.frames).toEqual([
      { clipPath: "inset(0 100% 0 0)", opacity: 0 },
      { clipPath: "inset(0 0 0 0)", opacity: 1 },
    ]);
    expect(cues[5]?.frames).toEqual([
      { clipPath: "inset(8% 0 8% 0)", opacity: 0 },
      { clipPath: "inset(0 0 0 0)", opacity: 1 },
    ]);
  });

  it("GIVEN the optional FAQ row group is empty WHEN planned THEN required service cues keep their exact schedule", () => {
    const targets = { ...createHomeServiceTargets(), rows: [] };
    const cues = createHomeServicePlan({ targets, tier: "lite" });

    expect(cues.map(({ role }) => role)).toEqual([
      "header",
      "action",
      "contact",
    ]);
    expect(cues.map(({ delayMs }) => delayMs)).toEqual([0, 260, 300]);
    expect(maximumEnd(cues)).toBe(940);
  });
});
