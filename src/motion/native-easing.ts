export type NativeMotionEase = "enter" | "material" | "snap";

type EaseFunction = (progress: number) => number;

const EASING_SAMPLE_INTERVALS = 64;
const SERIALIZED_DECIMAL_PLACES = 6;

const NATIVE_EASING_FUNCTIONS: Readonly<
  Record<NativeMotionEase, EaseFunction>
> = Object.freeze({
  enter: (progress) => 1 - (1 - progress) ** 5,
  material: (progress) => {
    const remaining = 1 - progress;
    const exponential = 2 ** (-10 * progress) * remaining;
    return 1 - (exponential + remaining ** 6 * progress);
  },
  snap: (progress) => 1 - (1 - progress) ** 4,
});

function normalize(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Native easing samples must be finite.");
  }
  return Object.is(value, -0) ? 0 : value;
}

function serialize(value: number): string {
  const fixed = normalize(value).toFixed(SERIALIZED_DECIMAL_PLACES);
  return fixed.replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
}

function sampleEase(ease: EaseFunction): string {
  const stops = Array.from(
    { length: EASING_SAMPLE_INTERVALS + 1 },
    (_, index) => {
      const progress = index / EASING_SAMPLE_INTERVALS;
      const value =
        index === 0
          ? 0
          : index === EASING_SAMPLE_INTERVALS
            ? 1
            : ease(progress);
      return `${serialize(value)} ${serialize(progress * 100)}%`;
    },
  );
  return `linear(${stops.join(", ")})`;
}

/** CSS-native curves sampled from the installed GSAP 3.15 easing definitions. */
export const NATIVE_MOTION_EASING: Readonly<Record<NativeMotionEase, string>> =
  Object.freeze({
    enter: sampleEase(NATIVE_EASING_FUNCTIONS.enter),
    material: sampleEase(NATIVE_EASING_FUNCTIONS.material),
    snap: sampleEase(NATIVE_EASING_FUNCTIONS.snap),
  });
