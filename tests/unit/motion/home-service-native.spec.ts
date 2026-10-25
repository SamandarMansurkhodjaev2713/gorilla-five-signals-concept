import { describe, expect, it } from "vitest";

import {
  SERVICE_ACTION_SELECTOR,
  SERVICE_CONTACT_COPY_SELECTOR,
  SERVICE_CONTACT_SELECTOR,
  SERVICE_CONTACT_WORD_SELECTOR,
  SERVICE_HEADER_SELECTOR,
  SERVICE_ROW_SELECTOR,
} from "@/motion/scene-setups/home-service-motion-contract";
import { createNativeHomeServiceEntrance } from "@/motion/scene-setups/home-service-native";
import { createHomeServiceTargets } from "./home-service-native.fixture";

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
  readonly customInline?: "important" | "value";
  readonly missingHeader?: boolean;
  readonly support?: "supported" | "unsupported";
}

function createHarness(options: HarnessOptions = {}) {
  const targets = createHomeServiceTargets();
  const animations: AnimationPort[] = [];
  const style = {
    getPropertyPriority: (property: string): string =>
      options.customInline === "important" && property === "clip-path"
        ? "important"
        : "",
    getPropertyValue: (property: string): string =>
      options.customInline === "value" && property === "opacity" ? "0.4" : "",
  };
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
  const single = new Map<string, HTMLElement>([
    [SERVICE_HEADER_SELECTOR, targets.header],
    [SERVICE_ACTION_SELECTOR, targets.action],
    [SERVICE_CONTACT_SELECTOR, targets.contact],
    [SERVICE_CONTACT_WORD_SELECTOR, targets.contactWord],
  ]);
  const lists = new Map<string, readonly HTMLElement[]>([
    [SERVICE_ROW_SELECTOR, targets.rows],
    [SERVICE_CONTACT_COPY_SELECTOR, targets.contactCopy],
  ]);
  const all = [
    targets.header,
    ...targets.rows,
    targets.action,
    targets.contact,
    targets.contactWord,
    ...targets.contactCopy,
  ];
  for (const target of all) Reflect.set(target, "style", style);
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
    querySelector: (selector: string): HTMLElement | null =>
      options.missingHeader === true && selector === SERVICE_HEADER_SELECTOR
        ? null
        : (single.get(selector) ?? null),
    querySelectorAll: (selector: string): readonly HTMLElement[] =>
      lists.get(selector) ?? [],
  };
  // TYPE-EXCEPTION: This focused adapter fake exposes only scoped queries,
  // inline declarations and public WAAPI constructors used by the boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const root = rootPort as unknown as HTMLElement;
  return { animations, root };
}

describe("home-service native entrance boundary", () => {
  it.each(["value", "important"] as const)(
    "GIVEN custom inline %s WHEN evaluated THEN exact-snapshot GSAP fallback wins",
    (customInline) => {
      const { root } = createHarness({ customInline });
      expect(
        createNativeHomeServiceEntrance({
          root,
          tier: "full",
          onComplete: (): void => undefined,
          onFailure: (): void => undefined,
        }),
      ).toBeNull();
    },
  );

  it("GIVEN unsupported WAAPI WHEN evaluated THEN fallback remains available without allocating effects", () => {
    const { animations, root } = createHarness({ support: "unsupported" });
    expect(
      createNativeHomeServiceEntrance({
        root,
        tier: "lite",
        onComplete: (): void => undefined,
        onFailure: (): void => undefined,
      }),
    ).toBeNull();
    expect(animations).toEqual([]);
  });

  it("GIVEN supported Full motion WHEN played THEN all 12 effects receive scoped IDs", () => {
    const harness = createHarness();
    const player = createNativeHomeServiceEntrance({
      root: harness.root,
      tier: "full",
      onComplete: (): void => undefined,
      onFailure: (): void => undefined,
    });
    if (player === null) throw new Error("Expected a native service player.");

    player.play();

    expect(harness.animations).toHaveLength(12);
    expect(harness.animations.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "gorilla-home-service:header:0",
        "gorilla-home-service:contact:5",
        "gorilla-home-service:contact-copy:11",
      ]),
    );
    player.destroy();
  });

  it("GIVEN a required hook is missing WHEN targets are read THEN malformed markup fails before allocation", () => {
    const { animations, root } = createHarness({ missingHeader: true });
    expect(() =>
      createNativeHomeServiceEntrance({
        root,
        tier: "full",
        onComplete: (): void => undefined,
        onFailure: (): void => undefined,
      }),
    ).toThrow(
      `Home-service motion hook is missing: ${SERVICE_HEADER_SELECTOR}`,
    );
    expect(animations).toEqual([]);
  });
});
