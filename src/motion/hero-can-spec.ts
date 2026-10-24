import { MOTION_EASE } from "./tokens";

export const HERO_CAN_ENTRY_SPEC = Object.freeze({
  rotationDegrees: -7,
  scale: 0.76,
  travelY: 112,
  restRotationDegrees: 2,
});

export const HERO_COMPACT_MEDIA_QUERY = "(max-width: 22rem)";
export const HERO_CAN_COMPACT_ENTRY_SPEC = Object.freeze({
  rotationDegrees: -3,
  scale: 0.92,
  travelY: 32,
  restRotationDegrees: HERO_CAN_ENTRY_SPEC.restRotationDegrees,
});

/** CSS and native matchMedia use this same breakpoint, independent of root text scaling. */
export function resolveHeroCanEntrySpec(options: {
  readonly compact: boolean;
}) {
  return options.compact ? HERO_CAN_COMPACT_ENTRY_SPEC : HERO_CAN_ENTRY_SPEC;
}

const BACK_OUT_PATTERN = /^back\.out\((\d+(?:\.\d+)?)\)$/u;
const BACK_PEAK_CUBIC_FACTOR = 4;
const BACK_PEAK_DENOMINATOR = 27;

function configuredBackPeak(): number {
  const overshootText = BACK_OUT_PATTERN.exec(MOTION_EASE.settle)?.[1];
  if (overshootText === undefined)
    throw new Error(
      "Hero framing must be reviewed when its settle easing changes.",
    );
  const overshoot = Number(overshootText);
  return (
    1 +
    (BACK_PEAK_CUBIC_FACTOR * overshoot ** 3) /
      (BACK_PEAK_DENOMINATOR * (overshoot + 1) ** 2)
  );
}

const EASING_PEAK = configuredBackPeak();

export const HERO_CAN_ENVELOPE = Object.freeze({
  rotationDegrees: Math.max(
    Math.abs(HERO_CAN_ENTRY_SPEC.rotationDegrees),
    Math.abs(
      HERO_CAN_ENTRY_SPEC.rotationDegrees +
        (HERO_CAN_ENTRY_SPEC.restRotationDegrees -
          HERO_CAN_ENTRY_SPEC.rotationDegrees) *
          EASING_PEAK,
    ),
  ),
  scale:
    HERO_CAN_ENTRY_SPEC.scale + (1 - HERO_CAN_ENTRY_SPEC.scale) * EASING_PEAK,
  travelY: HERO_CAN_ENTRY_SPEC.travelY,
});
