import { describe, expect, it } from "vitest";

import {
  FOOTER_PRESENTATION_PROPERTIES,
  FOOTER_SIGNAL_SELECTOR,
} from "@/motion/scene-setups/footer-motion-contract";
import { createNativeFooterEntrance } from "@/motion/scene-setups/footer-native";
import { createFooterCopy, createFooterSignals } from "./footer-native.fixture";

class AnimationPort extends EventTarget {
  id = "";
  startTime: number | null = null;
  cancel(): void {
    return undefined;
  }
  play(): void {
    return undefined;
  }
}

interface HarnessOptions {
  readonly copy?: "present";
  readonly customInline?: "important" | "value";
  readonly signalCount?: number;
  readonly support?: "supported" | "unsupported";
}

function createHarness(options: HarnessOptions = {}) {
  const signals = createFooterSignals(options.signalCount);
  const copy = options.copy === "present" ? [createFooterCopy()] : [];
  const animations: AnimationPort[] = [];
  const style = {
    getPropertyPriority: (property: string): string =>
      options.customInline === "important" && property === "transform-origin"
        ? "important"
        : "",
    getPropertyValue: (property: string): string =>
      options.customInline === "value" && property === "transform"
        ? "scaleX(0.5)"
        : "",
  };
  for (const target of [...signals, ...copy])
    Reflect.set(target, "style", style);
  class EffectPort {
    target: unknown;
    private timing: Readonly<KeyframeEffectOptions>;
    constructor(
      targetOrSource: unknown,
      frames?: readonly Keyframe[],
      timing?: Readonly<KeyframeEffectOptions>,
    ) {
      if (targetOrSource instanceof EffectPort) {
        this.target = targetOrSource.target;
        this.timing = { ...targetOrSource.getTiming() };
        return;
      }
      if (frames === undefined || timing === undefined)
        throw new TypeError("Original effects require frames and timing.");
      this.target = targetOrSource;
      this.timing = { delay: 0, ...timing };
    }
    getTiming(): Readonly<KeyframeEffectOptions> {
      return this.timing;
    }
    updateTiming(timing: Readonly<OptionalEffectTiming>): void {
      this.timing = { ...this.timing, ...timing };
    }
  }
  class AnimationConstructor {
    constructor() {
      const animation = new AnimationPort();
      animations.push(animation);
      return animation;
    }
  }
  const rootPort = {
    ownerDocument: {
      defaultView: {
        Animation: AnimationConstructor,
        CSS: { supports: (): boolean => options.support !== "unsupported" },
        KeyframeEffect: EffectPort,
        TypeError,
      },
      timeline: { currentTime: 200 },
    },
    querySelectorAll: (selector: string): readonly HTMLElement[] =>
      selector === FOOTER_SIGNAL_SELECTOR ? signals : copy,
  };
  // TYPE-EXCEPTION: This boundary fake supplies only scoped queries, inline
  // style inspection, and the public WAAPI constructors consumed here.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const root = rootPort as unknown as HTMLElement;
  return { animations, root };
}

function createPlayer(root: HTMLElement) {
  return createNativeFooterEntrance({
    root,
    onComplete: (): void => undefined,
    onFailure: (): void => undefined,
  });
}

describe("footer native entrance boundary", () => {
  it("GIVEN transform ownership WHEN presentation is guarded THEN every GSAP transform declaration is included", () => {
    expect(FOOTER_PRESENTATION_PROPERTIES).toEqual([
      "clip-path",
      "opacity",
      "rotate",
      "scale",
      "transform",
      "transform-origin",
      "translate",
      "visibility",
    ]);
  });

  it("GIVEN the exact supported footer WHEN played THEN six scoped native effects are allocated", () => {
    const harness = createHarness();
    const player = createPlayer(harness.root);
    if (player === null) throw new Error("Expected a native footer player.");

    player.play();

    expect(harness.animations).toHaveLength(6);
    expect(harness.animations.map(({ id }) => id)).toEqual([
      "gorilla-footer:signal:0",
      "gorilla-footer:signal:1",
      "gorilla-footer:signal:2",
      "gorilla-footer:signal:3",
      "gorilla-footer:signal:4",
      "gorilla-footer:signal:5",
    ]);
    player.destroy();
  });

  it.each([
    { label: "unsupported WAAPI", options: { support: "unsupported" } },
    { label: "a missing signal", options: { signalCount: 5 } },
    { label: "an unexpected copy target", options: { copy: "present" } },
    { label: "an unexpected signal", options: { signalCount: 7 } },
  ] as const)(
    "GIVEN $label WHEN evaluated THEN GSAP fallback wins without allocating animations",
    ({ options }) => {
      const harness = createHarness(options);
      expect(createPlayer(harness.root)).toBeNull();
      expect(harness.animations).toEqual([]);
    },
  );

  it.each(["value", "important"] as const)(
    "GIVEN custom inline %s transform presentation WHEN evaluated THEN exact-snapshot fallback wins",
    (customInline) => {
      const harness = createHarness({ customInline });
      expect(createPlayer(harness.root)).toBeNull();
      expect(harness.animations).toEqual([]);
    },
  );
});
