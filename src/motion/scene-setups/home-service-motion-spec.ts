import { MOTION_DURATION_SECONDS } from "../tokens";

/** One timing source keeps the native and GSAP service entrances aligned. */
export const HOME_SERVICE_TIMING_SECONDS = Object.freeze({
  actionDelay: 0.26,
  contactDelay: 0.3,
  contactCopyDelay: 0.44,
  contactWordDelay: 0.36,
  rowDelay: 0.12,
  sceneDuration: MOTION_DURATION_SECONDS.scene,
  stagger: 0.055,
  standardDuration: MOTION_DURATION_SECONDS.standard,
});
