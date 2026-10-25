import { describe, expect, it } from "vitest";

import {
  TERMINAL_COPY_SELECTOR,
  TERMINAL_FIELD_SELECTOR,
  TERMINAL_LOCATOR_COPY_SELECTOR,
  TERMINAL_LOCATOR_SELECTOR,
  TERMINAL_LOCATOR_SIGNAL_SELECTOR,
  TERMINAL_NODE_SELECTOR,
  TERMINAL_TRACE_SELECTOR,
  TERMINAL_WORD_SELECTOR,
  readTerminalEntranceTargets,
} from "@/motion/scene-setups/home-terminal-motion-contract";
import { createNativeTerminalEntrance } from "@/motion/scene-setups/home-terminal-native";
import { createTerminalTargets } from "./home-terminal-native.fixture";

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

interface NativeRootOptions {
  readonly customInline?: "important" | "value";
  readonly defaultView?: "active" | "null";
  readonly missingField?: boolean;
  readonly support?: "supported" | "unsupported";
}

interface NativeHarness {
  readonly animations: AnimationPort[];
  readonly root: HTMLElement;
}

function createNativeHarness(options: NativeRootOptions = {}): NativeHarness {
  const style = {
    getPropertyPriority: (property: string): string =>
      options.customInline === "important" && property === "opacity"
        ? "important"
        : "",
    getPropertyValue: (property: string): string =>
      options.customInline === "value" && property === "opacity" ? "0.5" : "",
  };
  const targets = createTerminalTargets();
  const elements = [
    ...targets.copy,
    targets.field,
    ...targets.trace,
    ...targets.nodes,
    targets.locator,
    ...targets.locatorSignals,
    ...targets.locatorCopy,
  ].map((element) => ({ element, style }));
  const byTarget = new Map(
    elements.map(({ element, style: value }) => [element, value]),
  );
  const animations: AnimationPort[] = [];
  class KeyframeEffectPort {
    target: unknown;
    private timing: Readonly<KeyframeEffectOptions>;

    constructor(
      targetOrSource: unknown,
      frames?: readonly Keyframe[],
      timing?: Readonly<KeyframeEffectOptions>,
    ) {
      if (targetOrSource instanceof KeyframeEffectPort) {
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
  const windowPort = {
    Animation: AnimationConstructor,
    CSS: { supports: (): boolean => options.support !== "unsupported" },
    KeyframeEffect: KeyframeEffectPort,
    TypeError,
  };
  const lists = new Map<string, readonly HTMLElement[]>([
    [TERMINAL_COPY_SELECTOR, targets.copy],
    [TERMINAL_TRACE_SELECTOR, targets.trace],
    [TERMINAL_NODE_SELECTOR, targets.nodes],
    [TERMINAL_LOCATOR_SIGNAL_SELECTOR, targets.locatorSignals],
    [TERMINAL_LOCATOR_COPY_SELECTOR, targets.locatorCopy],
  ]);
  const rootPort = {
    ownerDocument: {
      defaultView: options.defaultView === "null" ? null : windowPort,
      timeline: { currentTime: 200 },
    },
    querySelector: (selector: string): HTMLElement | null => {
      if (selector === TERMINAL_FIELD_SELECTOR)
        return options.missingField === true ? null : targets.field;
      if (selector === TERMINAL_WORD_SELECTOR) return targets.word;
      if (selector === TERMINAL_LOCATOR_SELECTOR) return targets.locator;
      return null;
    },
    querySelectorAll: (selector: string): readonly HTMLElement[] =>
      (lists.get(selector) ?? []).map((element) => {
        Reflect.set(element, "style", byTarget.get(element));
        return element;
      }),
  };
  for (const { element, style: value } of elements)
    Reflect.set(element, "style", value);
  // TYPE-EXCEPTION: The adapter fake exposes only scoped queries, inline
  // declarations and public WAAPI constructors consumed by this boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const root = rootPort as unknown as HTMLElement;
  return { animations, root };
}

describe("terminal native entrance boundary", () => {
  it.each(["value", "important"] as const)(
    "GIVEN custom inline %s WHEN evaluated THEN exact-snapshot fallback wins",
    (customInline) => {
      const { root } = createNativeHarness({ customInline });
      expect(
        createNativeTerminalEntrance({
          root,
          tier: "full",
          onComplete: (): void => undefined,
          onFailure: (): void => undefined,
        }),
      ).toBeNull();
    },
  );

  it.each([
    { defaultView: "null" as const },
    { support: "unsupported" as const },
  ])(
    "GIVEN an unsupported public animation boundary %# WHEN evaluated THEN GSAP fallback remains available",
    (options) => {
      const { root } = createNativeHarness(options);
      expect(
        createNativeTerminalEntrance({
          root,
          tier: "lite",
          onComplete: (): void => undefined,
          onFailure: (): void => undefined,
        }),
      ).toBeNull();
    },
  );

  it("GIVEN a supported Full boundary WHEN played THEN every effect receives a scoped terminal ID", () => {
    const harness = createNativeHarness();
    const player = createNativeTerminalEntrance({
      root: harness.root,
      tier: "full",
      onComplete: (): void => undefined,
      onFailure: (): void => undefined,
    });
    if (player === null) throw new Error("Expected a native terminal player.");

    player.play();

    expect(harness.animations).toHaveLength(21);
    expect(harness.animations.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "gorilla-terminal:copy:0",
        "gorilla-terminal:field:4",
        "gorilla-terminal:locator:14",
        "gorilla-terminal:locator-copy:20",
      ]),
    );
    player.destroy();
  });

  it("GIVEN a required field is absent WHEN targets are read THEN malformed markup fails explicitly", () => {
    const { root } = createNativeHarness({ missingField: true });
    expect(() => readTerminalEntranceTargets(root)).toThrow(
      `Terminal motion hook is missing: ${TERMINAL_FIELD_SELECTOR}`,
    );
  });
});
