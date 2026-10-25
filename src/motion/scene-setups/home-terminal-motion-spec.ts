import { MOTION_DURATION_SECONDS } from "../tokens";

/** One timing source keeps the native and GSAP terminal entrances aligned. */
export const TERMINAL_MOTION_TIMING_SECONDS = Object.freeze({
  coordinateDelay: 0.24,
  fieldDelay: 0.08,
  locatorCopyDelay: 0.62,
  locatorFullDelay: 0.48,
  locatorLiteDelay: 0.22,
  locatorSignalDelay: 0.56,
  nodeDelay: 0.36,
  quickDuration: MOTION_DURATION_SECONDS.quick,
  sceneDuration: MOTION_DURATION_SECONDS.scene,
  standardDuration: MOTION_DURATION_SECONDS.standard,
  traceStagger: 0.055,
});
