import { MOTION_DISTANCE_PX, MOTION_DURATION_SECONDS } from "../tokens";

export const MANIFESTO_SELECTOR = Object.freeze({
  handoff: ".manifesto-handoff",
  lines: "[data-manifesto-line]",
  copy: ".manifesto-intro",
  transmission: ".manifesto-transmission > span",
  signals: "[data-motion-signal]",
});
export const MANIFESTO_PRESENTATION_SELECTOR =
  Object.values(MANIFESTO_SELECTOR).join(", ");
export const MANIFESTO_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;

/** Preserve the actual implicit GSAP appends and overlaps in both backends. */
export const MANIFESTO_MOTION_SPEC = Object.freeze({
  handoffDuration: MOTION_DURATION_SECONDS.standard,
  lineDuration: MOTION_DURATION_SECONDS.scene,
  supportDuration: MOTION_DURATION_SECONDS.standard,
  lineStagger: 0.075,
  signalStagger: 0.045,
  copyOverlap: 0.42,
  transmissionOverlap: 0.24,
  signalOverlap: 0.3,
  copyOffsetPx: MOTION_DISTANCE_PX.copyReveal,
});
