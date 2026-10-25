import { MOTION_DURATION_SECONDS } from "../tokens";

export const FOOTER_SIGNAL_COUNT = 6;

/** One timing source preserves the existing footer signal choreography. */
export const FOOTER_MOTION_TIMING_SECONDS = Object.freeze({
  signalDuration: MOTION_DURATION_SECONDS.standard,
  signalStagger: MOTION_DURATION_SECONDS.instant / 2,
});
