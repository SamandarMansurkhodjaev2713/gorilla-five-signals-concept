import { NATIVE_MOTION_EASING } from "../native-easing";
import { FOOTER_MOTION_TIMING_SECONDS } from "./footer-motion-spec";

import type { FiniteAnimationCue } from "../native/finite-animation-player";

const MILLISECONDS_PER_SECOND = 1_000;
const TIMING_PRECISION_FACTOR = 10_000;

function milliseconds(seconds: number): number {
  return (
    Math.round(seconds * MILLISECONDS_PER_SECOND * TIMING_PRECISION_FACTOR) /
    TIMING_PRECISION_FACTOR
  );
}

export function createFooterEntrancePlan(
  signals: readonly HTMLElement[],
): readonly FiniteAnimationCue[] {
  const timing = FOOTER_MOTION_TIMING_SECONDS;
  return signals.map((target, index) => ({
    target,
    role: "signal",
    delayMs: milliseconds(timing.signalStagger * index),
    durationMs: milliseconds(timing.signalDuration),
    easing: NATIVE_MOTION_EASING.snap,
    frames: [
      { transform: "scaleX(0)", transformOrigin: "left center" },
      { transform: "scaleX(1)", transformOrigin: "left center" },
    ],
  }));
}
