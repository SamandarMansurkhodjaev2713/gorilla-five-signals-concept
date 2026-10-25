import { describe, expect, it } from "vitest";

import { NATIVE_MOTION_EASING } from "@/motion/native-easing";
import {
  MATERIAL_COPY_SELECTOR,
  MATERIAL_STAGE_SELECTOR,
  createMaterialEntrancePlan,
  createNativeMaterialEntrance,
  readMaterialEntranceTargets,
} from "@/motion/scene-setups/material-film-native";

import type { MaterialEntranceTargets } from "@/motion/scene-setups/material-film-native";

function target(name: string): HTMLElement {
  const port = { name };
  // TYPE-EXCEPTION: The pure plan only preserves target identity; browser
  // animation construction is covered by the finite-player port tests.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as unknown as HTMLElement;
}

function createTargets(): MaterialEntranceTargets {
  return {
    copy: target("copy"),
    stage: target("stage"),
    calibration: Array.from({ length: 5 }, (_, index) =>
      target(`calibration-${String(index)}`),
    ),
    crosshair: Array.from({ length: 3 }, (_, index) =>
      target(`crosshair-${String(index)}`),
    ),
  };
}

function maximumEnd(
  cues: ReturnType<typeof createMaterialEntrancePlan>,
): number {
  return Math.max(...cues.map((cue) => cue.delayMs + cue.durationMs));
}

describe("material-film native entrance plan", () => {
  it.each([
    ["full", "inset(6% 4% 6% 4%)"],
    ["lite", "inset(2% 0 2% 0)"],
  ] as const)(
    "GIVEN the %s tier WHEN the plan is created THEN all ten authored cues share the exact 640ms choreography",
    (tier, stageClipPath) => {
      const targets = createTargets();
      const cues = createMaterialEntrancePlan({ targets, tier });

      expect(cues).toHaveLength(10);
      expect(cues.map(({ role }) => role)).toEqual([
        "copy",
        "stage",
        "calibration",
        "calibration",
        "calibration",
        "calibration",
        "calibration",
        "crosshair",
        "crosshair",
        "crosshair",
      ]);
      expect(cues.map(({ delayMs }) => delayMs)).toEqual([
        0, 0, 180, 220, 260, 300, 340, 240, 280, 320,
      ]);
      expect(cues.map(({ durationMs }) => durationMs)).toEqual([
        640, 640, 260, 260, 260, 260, 260, 260, 260, 260,
      ]);
      expect(maximumEnd(cues)).toBe(640);
      expect(cues[0]?.easing).toBe(NATIVE_MOTION_EASING.enter);
      expect(cues[1]?.easing).toBe(NATIVE_MOTION_EASING.material);
      expect(cues[1]?.frames[0]).toEqual({
        clipPath: stageClipPath,
        opacity: 0,
        visibility: "hidden",
      });
    },
  );

  it("GIVEN every material target WHEN its cue ends THEN native ownership returns to the visible CSS baseline", () => {
    const targets = createTargets();
    const cues = createMaterialEntrancePlan({ targets, tier: "full" });

    expect(cues.map(({ target: cueTarget }) => cueTarget)).toEqual([
      targets.copy,
      targets.stage,
      ...targets.calibration,
      ...targets.crosshair,
    ]);
    for (const cue of cues) {
      expect(cue.frames[1]).toEqual({
        clipPath: "inset(0 0 0 0)",
        opacity: 1,
        visibility: "visible",
      });
    }
  });
});

interface NativeRootOptions {
  readonly customInline?: "important" | "value";
  readonly defaultView?: "active" | "null";
  readonly missingStage?: boolean;
  readonly support?: "supported" | "unsupported";
}

function createNativeRoot(options: NativeRootOptions = {}): HTMLElement {
  const style = {
    getPropertyPriority: (property: string): string =>
      options.customInline === "important" && property === "opacity"
        ? "important"
        : "",
    getPropertyValue: (property: string): string =>
      options.customInline === "value" && property === "opacity" ? "0.5" : "",
  };
  const elements = Array.from({ length: 10 }, (_, index) => ({
    name: `target-${String(index)}`,
    style,
  }));
  const copy = elements[0];
  const stage = elements[1];
  const calibration = elements.slice(2, 7);
  const crosshair = elements.slice(7);
  class KeyframeEffectPort {
    constructor(
      targetValue: unknown,
      frames: readonly Keyframe[],
      timing: Readonly<KeyframeEffectOptions>,
    ) {
      void targetValue;
      void frames;
      void timing;
    }
  }
  class AnimationPort {}
  const windowPort = {
    Animation: AnimationPort,
    CSS: {
      supports: (): boolean => options.support !== "unsupported",
    },
    KeyframeEffect: KeyframeEffectPort,
    TypeError,
  };
  const documentPort = {
    defaultView: options.defaultView === "null" ? null : windowPort,
    timeline: { currentTime: 200 },
  };
  const rootPort = {
    ownerDocument: documentPort,
    querySelector: (selector: string): unknown => {
      if (selector === MATERIAL_COPY_SELECTOR) return copy;
      if (selector === MATERIAL_STAGE_SELECTOR)
        return options.missingStage === true ? null : stage;
      return null;
    },
    querySelectorAll: (selector: string): readonly unknown[] =>
      selector.includes("calibration") ? calibration : crosshair,
  };
  // TYPE-EXCEPTION: The native-plan boundary uses only ownerDocument, scoped
  // queries and inline style reads supplied by this focused DOM port.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return rootPort as unknown as HTMLElement;
}

describe("material-film native entrance boundary", () => {
  it.each(["value", "important"] as const)(
    "GIVEN a custom inline %s WHEN the native boundary is evaluated THEN it selects the exact-snapshot GSAP fallback",
    (customInline) => {
      const player = createNativeMaterialEntrance({
        root: createNativeRoot({ customInline }),
        tier: "full",
        onComplete: (): void => undefined,
        onFailure: (): void => undefined,
      });

      expect(player).toBeNull();
    },
  );

  it.each([
    { defaultView: "null" as const },
    { support: "unsupported" as const },
  ])(
    "GIVEN an unsupported native boundary %# WHEN evaluated THEN it degrades to the verified fallback",
    (options) => {
      const player = createNativeMaterialEntrance({
        root: createNativeRoot(options),
        tier: "lite",
        onComplete: (): void => undefined,
        onFailure: (): void => undefined,
      });

      expect(player).toBeNull();
    },
  );

  it("GIVEN a complete public animation surface WHEN evaluated THEN it creates the finite native owner", () => {
    const player = createNativeMaterialEntrance({
      root: createNativeRoot(),
      tier: "full",
      onComplete: (): void => undefined,
      onFailure: (): void => undefined,
    });

    expect(player).not.toBeNull();
  });

  it("GIVEN a required motion hook is absent WHEN targets are read THEN the malformed scene fails explicitly", () => {
    expect(() =>
      readMaterialEntranceTargets(createNativeRoot({ missingStage: true })),
    ).toThrow(
      `Material-film motion hook is missing: ${MATERIAL_STAGE_SELECTOR}`,
    );
  });
});
