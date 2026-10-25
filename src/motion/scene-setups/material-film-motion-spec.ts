import { MOTION_DURATION_SECONDS } from "../tokens";

/** One timing source keeps the native plan and verified GSAP fallback aligned. */
export const MATERIAL_FILM_TIMING_SECONDS = Object.freeze({
  calibrationDelay: 0.18,
  crosshairDelay: 0.24,
  itemStagger: 0.04,
  sceneDuration: MOTION_DURATION_SECONDS.scene,
  standardDuration: MOTION_DURATION_SECONDS.standard,
});
