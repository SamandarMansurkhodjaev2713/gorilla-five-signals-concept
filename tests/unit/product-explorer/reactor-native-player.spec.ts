import { describe, expect, it, vi } from "vitest";

import { REACTOR_NATIVE_EASING } from "@/features/flavor-reactor/native/reactor-easing";
import { ReactorNativePlayer } from "@/features/flavor-reactor/native/reactor-native-player";

import type { ReactorNativeCue } from "@/features/flavor-reactor/native/reactor-native-types";
import type { Mock } from "vitest";

interface EffectHarness {
  readonly construction: "clone" | "original";
  readonly frames: readonly Keyframe[];
  readonly source: EffectHarness | null;
  target: unknown;
  timing: Readonly<KeyframeEffectOptions>;
}

class AnimationHarness extends EventTarget {
  cancelCalls = 0;
  id = "";
  playCalls = 0;
  startTime: number | null = null;

  constructor(
    readonly effect: EffectHarness,
    readonly timelineValue: unknown,
    private readonly animationIndex: number,
    private readonly state: PortState,
  ) {
    super();
  }

  cancel(): void {
    this.cancelCalls += 1;
    const failure = this.state.cancelFailures.get(this.animationIndex);
    if (failure !== undefined) throw failure;
  }

  play(): void {
    this.playCalls += 1;
    this.state.animationCountAtPlay.push(this.state.animations.length);
  }
}

interface PortState {
  readonly animationCountAtPlay: number[];
  readonly animations: AnimationHarness[];
  readonly cancelFailures: ReadonlyMap<number, Error>;
  readonly effects: EffectHarness[];
}

interface PlayerHarness {
  readonly animations: readonly AnimationHarness[];
  readonly documentValue: Document;
  readonly effects: readonly EffectHarness[];
  readonly onComplete: Mock<() => void>;
  readonly onFailure: Mock<(error: unknown) => void>;
  readonly playConstructionCounts: readonly number[];
}

interface PortFailure {
  readonly error: Error;
  readonly index: number;
}

function createPorts(
  options: {
    readonly animationFailure?: PortFailure;
    readonly cancelFailures?: ReadonlyMap<number, Error>;
    readonly currentTime?: number | null;
    readonly effectFailure?: PortFailure;
    readonly originalMutationFailure?: Error;
  } = {},
): PlayerHarness {
  const state: PortState = {
    animationCountAtPlay: [],
    animations: [],
    cancelFailures: options.cancelFailures ?? new Map(),
    effects: [],
  };
  let effectAttempt = 0;
  let animationAttempt = 0;

  class KeyframeEffectPort implements EffectHarness {
    readonly construction: "clone" | "original";
    readonly frames: readonly Keyframe[];
    readonly source: EffectHarness | null;
    private targetValue: unknown;
    timing: Readonly<KeyframeEffectOptions>;

    constructor(
      targetOrSource: unknown,
      frames?: readonly Keyframe[],
      timing?: Readonly<KeyframeEffectOptions>,
    ) {
      const index = effectAttempt;
      effectAttempt += 1;
      if (options.effectFailure?.index === index)
        throw options.effectFailure.error;
      if (targetOrSource instanceof KeyframeEffectPort) {
        this.construction = "clone";
        this.frames = targetOrSource.frames.map((frame) => ({ ...frame }));
        this.source = targetOrSource;
        this.targetValue = targetOrSource.target;
        this.timing = { ...targetOrSource.timing };
      } else {
        if (frames === undefined || timing === undefined)
          throw new TypeError("Original effects require frames and timing.");
        this.construction = "original";
        this.frames = frames.map((frame) => {
          const copy = { ...frame };
          if (typeof copy.offset === "number" && !Number.isFinite(copy.offset))
            throw new TypeError("Keyframe offsets must be finite.");
          return copy;
        });
        this.source = null;
        this.targetValue = targetOrSource;
        this.timing = timing;
      }
      state.effects.push(this);
    }

    get target(): unknown {
      return this.targetValue;
    }

    set target(value: unknown) {
      if (
        this.construction === "original" &&
        options.originalMutationFailure !== undefined
      )
        throw options.originalMutationFailure;
      this.targetValue = value;
    }

    getTiming(): Readonly<KeyframeEffectOptions> {
      return this.timing;
    }

    updateTiming(timing: Readonly<OptionalEffectTiming>): void {
      if (
        this.construction === "original" &&
        options.originalMutationFailure !== undefined
      )
        throw options.originalMutationFailure;
      this.timing = { ...this.timing, ...timing };
    }
  }

  class AnimationPort extends EventTarget {
    constructor(effect: EffectHarness, timelineValue: unknown) {
      super();
      const index = animationAttempt;
      animationAttempt += 1;
      if (options.animationFailure?.index === index)
        throw options.animationFailure.error;
      const animation = new AnimationHarness(
        effect,
        timelineValue,
        index,
        state,
      );
      state.animations.push(animation);
      return animation;
    }
  }

  const timeline = {
    currentTime: options.currentTime === undefined ? 720 : options.currentTime,
  };
  const documentPort = {
    defaultView: {
      Animation: AnimationPort,
      KeyframeEffect: KeyframeEffectPort,
    },
    timeline,
  };
  return {
    animations: state.animations,
    // TYPE-EXCEPTION: This focused native-port fake implements only defaultView
    // constructors and document.timeline consumed by ReactorNativePlayer.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    documentValue: documentPort as unknown as Document,
    effects: state.effects,
    onComplete: vi.fn<() => void>(),
    onFailure: vi.fn<(error: unknown) => void>(),
    playConstructionCounts: state.animationCountAtPlay,
  };
}

function target(name: string): HTMLElement {
  const port = { name };
  // TYPE-EXCEPTION: Native-player ownership treats targets as opaque element
  // identities; browser rendering belongs to the capability/parity suites.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as unknown as HTMLElement;
}

function createCues(): readonly ReactorNativeCue[] {
  return [
    {
      delayMs: 0,
      durationMs: 260,
      ease: "snap",
      frames: [{ opacity: 1 }, { opacity: 0 }],
      role: "product",
      target: target("product"),
    },
    {
      delayMs: 120,
      durationMs: 640,
      ease: "enter",
      frames: [{ opacity: 0 }, { opacity: 1 }],
      role: "copy",
      target: target("copy"),
    },
    {
      delayMs: 640,
      durationMs: 880,
      ease: "material",
      frames: [{ transform: "scale(.62)" }, { transform: "scale(1)" }],
      role: "orbit",
      target: target("orbit"),
    },
  ];
}

function cueWithTiming(delayMs: number, durationMs: number): ReactorNativeCue {
  const cue = createCues()[0];
  if (cue === undefined) throw new Error("Missing native timing fixture.");
  return { ...cue, delayMs, durationMs };
}

function repeatedCues(): readonly ReactorNativeCue[] {
  const base = createCues()[1];
  if (base === undefined) throw new Error("Missing repeated cue fixture.");
  const source: ReactorNativeCue = {
    ...base,
    frames: [
      { opacity: 0, visibility: "hidden" },
      { opacity: 1, visibility: "visible" },
    ],
  };
  return [
    source,
    {
      ...source,
      delayMs: 360,
      frames: [
        { visibility: "hidden", opacity: 0 },
        { visibility: "visible", opacity: 1 },
      ],
      target: target("copy-secondary"),
    },
  ];
}

function cueWithFrames(
  frames: readonly [Keyframe, Keyframe],
  name: string,
): ReactorNativeCue {
  const base = createCues()[1];
  if (base === undefined) throw new Error("Missing frame cue fixture.");
  return { ...base, frames, target: target(name) };
}

function createPlayer(
  harness: PlayerHarness,
  cues: readonly ReactorNativeCue[] = createCues(),
): ReactorNativePlayer {
  return new ReactorNativePlayer({
    cues,
    documentValue: harness.documentValue,
    onComplete: harness.onComplete,
    onFailure: harness.onFailure,
  });
}

function firstFailure(harness: PlayerHarness): unknown {
  const invocation = harness.onFailure.mock.calls[0];
  if (invocation === undefined) throw new Error("Expected a player failure.");
  return invocation[0];
}

function aggregateCauses(error: unknown): readonly unknown[] {
  if (!(error instanceof AggregateError))
    throw new Error("Expected an AggregateError.");
  const causes: unknown = Reflect.get(error, "errors");
  if (!Array.isArray(causes)) throw new Error("Expected aggregate causes.");
  return causes;
}

describe("ReactorNativePlayer", () => {
  it("GIVEN three cues WHEN play starts THEN every effect is idle before the shared clock starts with scoped IDs, fill, frames, and sampled eases", () => {
    const harness = createPorts();
    const cues = createCues();
    const player = createPlayer(harness, cues);

    player.play();

    expect(harness.effects).toHaveLength(cues.length);
    expect(harness.effects.map(({ construction }) => construction)).toEqual([
      "original",
      "original",
      "original",
    ]);
    expect(harness.animations).toHaveLength(cues.length);
    expect(harness.playConstructionCounts).toEqual([3, 3, 3]);
    harness.animations.forEach((animation, index) => {
      const cue = cues[index];
      const effect = harness.effects[index];
      if (cue === undefined || effect === undefined)
        throw new Error("Missing native cue fixture.");
      expect(animation.id).toBe(`gorilla-reactor:${cue.role}:${String(index)}`);
      expect(animation.playCalls).toBe(1);
      expect(animation.startTime).toBe(720);
      expect(effect.target).toBe(cue.target);
      expect(effect.frames).toEqual([...cue.frames]);
      expect(effect.timing).toEqual({
        delay: cue.delayMs,
        duration: cue.durationMs,
        easing: REACTOR_NATIVE_EASING[cue.ease],
        fill: "both",
      });
      expect(String(effect.timing.easing).split(",")).toHaveLength(
        REACTOR_NATIVE_EASING[cue.ease].split(",").length,
      );
    });
    expect(harness.onFailure).not.toHaveBeenCalled();
  });

  it("GIVEN equivalent frame values with different property order and delay WHEN effects are built THEN one parsed source is cloned with independent target and timing", () => {
    const harness = createPorts();
    const cues = repeatedCues();
    const player = createPlayer(harness, cues);

    player.play();

    const [source, clone] = harness.effects;
    if (source === undefined || clone === undefined)
      throw new Error("Expected source and cloned effects.");
    expect(harness.effects.map(({ construction }) => construction)).toEqual([
      "original",
      "clone",
    ]);
    expect(clone.source).toBe(source);
    expect(source.target).toBe(cues[0]?.target);
    expect(clone.target).toBe(cues[1]?.target);
    expect(source.timing.delay).toBe(cues[0]?.delayMs);
    expect(clone.timing.delay).toBe(cues[1]?.delayMs);
    expect(source.frames).toEqual(clone.frames);
    expect(source.frames).not.toBe(clone.frames);
    expect(harness.animations).toHaveLength(2);
    expect(harness.onFailure).not.toHaveBeenCalled();
  });

  it("GIVEN a valid null offset followed by a non-finite offset WHEN effects are built THEN the unsafe frame bypasses reuse and native validation rolls back the prior animation", () => {
    const valid = cueWithFrames(
      [
        { offset: null, opacity: 0 },
        { offset: null, opacity: 1 },
      ],
      "valid-null-offset",
    );
    const invalid = cueWithFrames(
      [
        { offset: Number.NaN, opacity: 0 },
        { offset: Number.NaN, opacity: 1 },
      ],
      "invalid-nan-offset",
    );
    const harness = createPorts();
    const player = createPlayer(harness, [valid, invalid]);

    expect(() => player.play()).not.toThrow();

    expect(harness.effects).toHaveLength(1);
    expect(harness.effects[0]?.construction).toBe("original");
    expect(harness.animations).toHaveLength(1);
    expect(harness.animations[0]?.cancelCalls).toBe(1);
    expect(firstFailure(harness)).toMatchObject({
      message: "Keyframe offsets must be finite.",
    });
  });

  it("GIVEN an enumerable accessor frame WHEN equivalent cues are built THEN keying never evaluates it and each native constructor remains the sole reader", () => {
    let getterReads = 0;
    const accessorFrame: Keyframe = {};
    Object.defineProperty(accessorFrame, "opacity", {
      enumerable: true,
      get: (): number => {
        getterReads += 1;
        return 0;
      },
    });
    const frames: readonly [Keyframe, Keyframe] = [
      accessorFrame,
      { opacity: 1 },
    ];
    const harness = createPorts({
      originalMutationFailure: new Error(
        "An unsafe original effect must not receive clone mutations.",
      ),
    });
    const player = createPlayer(harness, [
      cueWithFrames(frames, "accessor-first"),
      cueWithFrames(frames, "accessor-second"),
    ]);

    player.play();

    expect(getterReads).toBe(2);
    expect(harness.effects.map(({ construction }) => construction)).toEqual([
      "original",
      "original",
    ]);
    expect(harness.animations).toHaveLength(2);
    expect(harness.onFailure).not.toHaveBeenCalled();
  });

  it("GIVEN a running group WHEN only the terminal animation finishes repeatedly THEN completion fires once", () => {
    const harness = createPorts();
    const player = createPlayer(harness);
    player.play();

    harness.animations[0]?.dispatchEvent(new Event("finish"));
    harness.animations[2]?.dispatchEvent(new Event("finish"));
    harness.animations[2]?.dispatchEvent(new Event("finish"));

    expect(harness.onComplete).toHaveBeenCalledTimes(1);
  });

  it("GIVEN a running group WHEN destroy repeats THEN listeners abort, every effect cancels once, and stale finish stays inert", () => {
    const harness = createPorts();
    const player = createPlayer(harness);
    player.play();

    player.destroy();
    player.destroy();
    harness.animations[2]?.dispatchEvent(new Event("finish"));

    expect(harness.animations.map(({ cancelCalls }) => cancelCalls)).toEqual([
      1, 1, 1,
    ]);
    expect(harness.onComplete).not.toHaveBeenCalled();
    expect(harness.onFailure).not.toHaveBeenCalled();
  });

  it("GIVEN KeyframeEffect construction fails partway WHEN play runs THEN every previously owned animation rolls back", () => {
    const setupError = new Error("effect construction failed");
    const harness = createPorts({
      effectFailure: { error: setupError, index: 2 },
    });
    const player = createPlayer(harness);

    expect(() => player.play()).not.toThrow();

    expect(harness.animations).toHaveLength(2);
    expect(harness.animations.map(({ cancelCalls }) => cancelCalls)).toEqual([
      1, 1,
    ]);
    expect(firstFailure(harness)).toBe(setupError);
  });

  it("GIVEN a repeated cue clone fails after its source animation exists WHEN play runs THEN the partial group rolls back exactly", () => {
    const cloneError = new Error("effect clone failed");
    const harness = createPorts({
      effectFailure: { error: cloneError, index: 1 },
    });
    const player = createPlayer(harness, repeatedCues());

    expect(() => player.play()).not.toThrow();

    expect(harness.effects).toHaveLength(1);
    expect(harness.effects[0]?.construction).toBe("original");
    expect(harness.animations).toHaveLength(1);
    expect(harness.animations[0]?.cancelCalls).toBe(1);
    expect(firstFailure(harness)).toBe(cloneError);
  });

  it("GIVEN Animation construction fails partway WHEN play runs THEN every previously owned animation rolls back", () => {
    const setupError = new Error("animation construction failed");
    const harness = createPorts({
      animationFailure: { error: setupError, index: 1 },
    });
    const player = createPlayer(harness);

    expect(() => player.play()).not.toThrow();

    expect(harness.effects).toHaveLength(2);
    expect(harness.animations).toHaveLength(1);
    expect(harness.animations[0]?.cancelCalls).toBe(1);
    expect(firstFailure(harness)).toBe(setupError);
  });

  it("GIVEN an inactive document timeline WHEN effects are ready THEN failure reports and cancels the whole idle group", () => {
    const harness = createPorts({ currentTime: null });
    const player = createPlayer(harness);

    expect(() => player.play()).not.toThrow();
    harness.animations[2]?.dispatchEvent(new Event("finish"));

    expect(harness.animations.map(({ cancelCalls }) => cancelCalls)).toEqual([
      1, 1, 1,
    ]);
    expect(firstFailure(harness)).toMatchObject({
      message: "The Reactor document timeline is inactive.",
    });
    expect(harness.onComplete).not.toHaveBeenCalled();
  });

  it("GIVEN setup fails and multiple cancellations throw WHEN rollback runs THEN every cancellation runs and all exact causes survive", () => {
    const setupError = new Error("third effect rejected");
    const firstCancelError = new Error("first cancel failed");
    const secondCancelError = new Error("second cancel failed");
    const harness = createPorts({
      cancelFailures: new Map([
        [0, firstCancelError],
        [1, secondCancelError],
      ]),
      effectFailure: { error: setupError, index: 2 },
    });
    const player = createPlayer(harness);

    expect(() => player.play()).not.toThrow();

    expect(harness.animations.map(({ cancelCalls }) => cancelCalls)).toEqual([
      1, 1,
    ]);
    const combined = firstFailure(harness);
    expect(combined).toMatchObject({
      message: "Reactor native setup and cleanup failed.",
    });
    const combinedCauses = aggregateCauses(combined);
    expect(combinedCauses[0]).toBe(setupError);
    const cleanupFailure = combinedCauses[1];
    expect(cleanupFailure).toMatchObject({
      message: "Reactor native effects failed to cancel.",
    });
    expect(aggregateCauses(cleanupFailure)).toEqual([
      secondCancelError,
      firstCancelError,
    ]);
  });

  it("GIVEN an empty cue plan WHEN play runs THEN it fails closed without constructing or playing effects", () => {
    const harness = createPorts();
    const player = createPlayer(harness, []);

    expect(() => player.play()).not.toThrow();

    expect(harness.effects).toEqual([]);
    expect(harness.animations).toEqual([]);
    expect(firstFailure(harness)).toMatchObject({
      message: "A Reactor native plan cannot be empty.",
    });
    expect(harness.onComplete).not.toHaveBeenCalled();
  });

  it.each([
    ["non-finite end", Number.MAX_VALUE, Number.MAX_VALUE],
    ["non-finite delay", Number.NaN, 260],
    ["non-finite duration", 0, Number.POSITIVE_INFINITY],
    ["negative delay", -1, 260],
    ["zero duration", 0, 0],
    ["negative duration", 0, -1],
  ] as const)(
    "GIVEN a cue with %s WHEN play validates timings THEN it reports before allocating effects and remains cleanup-safe",
    (_case, delayMs, durationMs) => {
      const harness = createPorts();
      const player = createPlayer(harness, [
        cueWithTiming(delayMs, durationMs),
      ]);

      expect(() => player.play()).not.toThrow();
      expect(() => player.destroy()).not.toThrow();
      player.play();

      expect(harness.effects).toEqual([]);
      expect(harness.animations).toEqual([]);
      expect(harness.onFailure).toHaveBeenCalledTimes(1);
      expect(firstFailure(harness)).toBeInstanceOf(RangeError);
      expect(firstFailure(harness)).toMatchObject({
        message: "Reactor effects require finite positive timing.",
      });
      expect(harness.onComplete).not.toHaveBeenCalled();
    },
  );
});
