import { describe, expect, it, vi } from "vitest";

import { REACTOR_NATIVE_EASING } from "@/features/flavor-reactor/native/reactor-easing";
import { ReactorNativePlayer } from "@/features/flavor-reactor/native/reactor-native-player";

import type { ReactorNativeCue } from "@/features/flavor-reactor/native/reactor-native-types";
import type { Mock } from "vitest";

interface EffectHarness {
  readonly frames: readonly Keyframe[];
  readonly target: unknown;
  readonly timing: Readonly<KeyframeEffectOptions>;
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

  class KeyframeEffectPort {
    constructor(
      target: unknown,
      frames: readonly Keyframe[],
      timing: Readonly<KeyframeEffectOptions>,
    ) {
      const index = effectAttempt;
      effectAttempt += 1;
      if (options.effectFailure?.index === index)
        throw options.effectFailure.error;
      state.effects.push({ frames, target, timing });
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
      expect(String(effect.timing.easing).split(",")).toHaveLength(65);
    });
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
