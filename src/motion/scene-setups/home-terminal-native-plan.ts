import { NATIVE_MOTION_EASING } from "../native-easing";
import { TERMINAL_MOTION_TIMING_SECONDS } from "./home-terminal-motion-spec";

import type { FiniteAnimationCue } from "../native/finite-animation-player";
import type { TerminalEntranceTargets } from "./home-terminal-motion-contract";

const MILLISECONDS_PER_SECOND = 1_000;
const REST_CLIP_PATH = "inset(0 0 0 0)";
// Mirrors the authored .tashkent-terminal__word CSS rest opacity without a
// computed-style read; update the plan proof whenever that CSS value changes.
const WORD_REST_OPACITY = 0.42;

export type TerminalEntranceTier = "full" | "lite";

function milliseconds(seconds: number): number {
  return seconds * MILLISECONDS_PER_SECOND;
}

function opacityCue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly delay: number;
  readonly duration: number;
  readonly easing: string;
  readonly restOpacity?: number | undefined;
}): FiniteAnimationCue {
  return {
    target: options.target,
    role: options.role,
    delayMs: milliseconds(options.delay),
    durationMs: milliseconds(options.duration),
    easing: options.easing,
    frames: [{ opacity: 0 }, { opacity: options.restOpacity ?? 1 }],
  };
}

function revealCue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly clipPath: string;
  readonly delay: number;
  readonly duration: number;
  readonly easing: string;
}): FiniteAnimationCue {
  const cue = opacityCue(options);
  return {
    ...cue,
    frames: [
      { clipPath: options.clipPath, opacity: 0 },
      { clipPath: REST_CLIP_PATH, opacity: 1 },
    ],
  };
}

function staggeredCues(options: {
  readonly targets: readonly HTMLElement[];
  readonly role: string;
  readonly delay: number;
  readonly duration: number;
  readonly easing: string;
  readonly clipPath?: string;
  readonly restOpacity?: (target: HTMLElement) => number;
}): readonly FiniteAnimationCue[] {
  return options.targets.map((target, index) => {
    const cueOptions = {
      ...options,
      target,
      delay:
        options.delay + TERMINAL_MOTION_TIMING_SECONDS.traceStagger * index,
    };
    return options.clipPath === undefined
      ? opacityCue({
          ...cueOptions,
          restOpacity: options.restOpacity?.(target),
        })
      : revealCue({ ...cueOptions, clipPath: options.clipPath });
  });
}

function fullTraceCues(
  targets: TerminalEntranceTargets,
): readonly FiniteAnimationCue[] {
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  return [
    ...staggeredCues({
      targets: targets.trace,
      role: "trace",
      delay: timing.coordinateDelay,
      duration: timing.standardDuration,
      easing: NATIVE_MOTION_EASING.enter,
      restOpacity: (target): number =>
        target === targets.word ? WORD_REST_OPACITY : 1,
    }),
    ...staggeredCues({
      targets: targets.nodes,
      role: "node",
      delay: timing.nodeDelay,
      duration: timing.quickDuration,
      easing: NATIVE_MOTION_EASING.snap,
    }),
  ];
}

function fullHandoffCues(
  targets: TerminalEntranceTargets,
): readonly FiniteAnimationCue[] {
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  return [
    ...staggeredCues({
      targets: targets.locatorSignals,
      role: "locator-signal",
      delay: timing.locatorSignalDelay,
      duration: timing.standardDuration,
      easing: NATIVE_MOTION_EASING.enter,
    }),
    ...staggeredCues({
      targets: targets.locatorCopy,
      role: "locator-copy",
      delay: timing.locatorCopyDelay,
      duration: timing.standardDuration,
      easing: NATIVE_MOTION_EASING.enter,
      clipPath: "inset(0 0 100% 0)",
    }),
  ];
}

export function createTerminalEntrancePlan(options: {
  readonly targets: TerminalEntranceTargets;
  readonly tier: TerminalEntranceTier;
}): readonly FiniteAnimationCue[] {
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  return [
    ...staggeredCues({
      targets: options.targets.copy,
      role: "copy",
      delay: 0,
      duration: timing.standardDuration,
      easing: NATIVE_MOTION_EASING.enter,
      clipPath: "inset(0 0 100% 0)",
    }),
    revealCue({
      target: options.targets.field,
      role: "field",
      clipPath: "inset(0 100% 0 0)",
      delay: timing.fieldDelay,
      duration: timing.sceneDuration,
      easing: NATIVE_MOTION_EASING.material,
    }),
    ...(options.tier === "full" ? fullTraceCues(options.targets) : []),
    revealCue({
      target: options.targets.locator,
      role: "locator",
      clipPath: "inset(8% 8% 8% 8%)",
      delay:
        options.tier === "full"
          ? timing.locatorFullDelay
          : timing.locatorLiteDelay,
      duration: timing.sceneDuration,
      easing: NATIVE_MOTION_EASING.material,
    }),
    ...(options.tier === "full" ? fullHandoffCues(options.targets) : []),
  ];
}
