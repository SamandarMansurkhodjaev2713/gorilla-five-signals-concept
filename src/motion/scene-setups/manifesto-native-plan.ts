import { NATIVE_MOTION_EASING } from "../native-easing";
import { MANIFESTO_MOTION_SPEC as SPEC } from "./manifesto-motion-spec";

import type { FiniteAnimationCue } from "../native/finite-animation-player";
import type { NativeMotionEase } from "../native-easing";

const MILLISECONDS_PER_SECOND = 1_000;
const TIMING_PRECISION_FACTOR = 10_000;
const REST_CLIP = "inset(0 0% 0 0)";

function milliseconds(seconds: number): number {
  // Match GSAP's seven-decimal second precision at exact reveal boundaries.
  return (
    Math.round(seconds * MILLISECONDS_PER_SECOND * TIMING_PRECISION_FACTOR) /
    TIMING_PRECISION_FACTOR
  );
}

export interface ManifestoTargets {
  readonly handoff: HTMLElement;
  readonly lines: readonly HTMLElement[];
  readonly copy: HTMLElement;
  readonly transmission: readonly HTMLElement[];
  readonly signals: readonly HTMLElement[];
}

function cue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly frames: readonly Keyframe[];
  readonly delay: number;
  readonly duration: number;
  readonly ease: NativeMotionEase;
}): FiniteAnimationCue {
  return {
    target: options.target,
    role: options.role,
    frames: options.frames,
    delayMs: milliseconds(options.delay),
    durationMs: milliseconds(options.duration),
    easing: NATIVE_MOTION_EASING[options.ease],
  };
}

function span(count: number, duration: number, stagger: number): number {
  return duration + Math.max(0, count - 1) * stagger;
}

function translatedReveal(
  target: HTMLElement,
  role: string,
  delay: number,
): FiniteAnimationCue {
  return cue({
    target,
    role,
    delay,
    duration: SPEC.supportDuration,
    ease: "enter",
    frames: [
      {
        opacity: 0,
        visibility: "hidden",
        transform: `translate3d(0, ${SPEC.copyOffsetPx}px, 0)`,
      },
      {
        opacity: 1,
        visibility: "visible",
        transform: "translate3d(0, 0px, 0)",
      },
    ],
  });
}

function schedule(targets: ManifestoTargets) {
  const linesEnd =
    SPEC.handoffDuration +
    span(targets.lines.length, SPEC.lineDuration, SPEC.lineStagger);
  const copyStart = linesEnd - SPEC.copyOverlap;
  const beforeTransmission = Math.max(
    linesEnd,
    copyStart + SPEC.supportDuration,
  );
  const transmissionStart = beforeTransmission - SPEC.transmissionOverlap;
  const transmissionEnd =
    transmissionStart +
    span(targets.transmission.length, SPEC.supportDuration, SPEC.signalStagger);
  const signalStart =
    Math.max(beforeTransmission, transmissionEnd) - SPEC.signalOverlap;
  return { copyStart, transmissionStart, signalStart };
}

function handoffCue(target: HTMLElement): FiniteAnimationCue {
  return cue({
    target,
    role: "handoff",
    delay: 0,
    duration: SPEC.handoffDuration,
    ease: "material",
    frames: [
      {
        transform: "translateX(-50%) scaleY(0)",
        transformOrigin: "top center",
      },
      {
        transform: "translateX(-50%) scaleY(1)",
        transformOrigin: "top center",
      },
    ],
  });
}

function lineCues(
  targets: readonly HTMLElement[],
): readonly FiniteAnimationCue[] {
  return targets.map((target, index) =>
    cue({
      target,
      role: "line",
      delay: SPEC.handoffDuration + index * SPEC.lineStagger,
      duration: SPEC.lineDuration,
      ease: "material",
      frames: [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: REST_CLIP }],
    }),
  );
}

function transmissionCues(
  targets: readonly HTMLElement[],
  delay: number,
): readonly FiniteAnimationCue[] {
  return targets.map((target, index) =>
    cue({
      target,
      role: "transmission",
      delay: delay + index * SPEC.signalStagger,
      duration: SPEC.supportDuration,
      ease: "material",
      frames: [
        { transform: "scaleX(0)", transformOrigin: "left center" },
        { transform: "scaleX(1)", transformOrigin: "left center" },
      ],
    }),
  );
}

/** A pure cue table: keep percentages as percentages and implicit appends intact. */
export function createManifestoPlan(
  targets: ManifestoTargets,
): readonly FiniteAnimationCue[] {
  if (
    [targets.lines, targets.transmission, targets.signals].some(
      (group) => group.length === 0,
    )
  )
    throw new RangeError("Manifesto requires non-empty reveal groups.");
  const { copyStart, transmissionStart, signalStart } = schedule(targets);
  return [
    handoffCue(targets.handoff),
    ...lineCues(targets.lines),
    translatedReveal(targets.copy, "copy", copyStart),
    ...transmissionCues(targets.transmission, transmissionStart),
    ...targets.signals.map((target, index) =>
      translatedReveal(
        target,
        "signal",
        signalStart + index * SPEC.signalStagger,
      ),
    ),
  ];
}
