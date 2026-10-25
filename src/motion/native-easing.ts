export type NativeMotionEase = "enter" | "material" | "snap";

type EaseFunction = (progress: number) => number;

const SERIALIZED_DECIMAL_PLACES = 6;
const MAX_NORMALIZED_SEGMENT_ERROR = 0.00004;
const MAX_SUBDIVISION_DEPTH = 12;
const MAX_EASING_STOPS = 513;
const ERROR_PROBES = [0.25, 0.5, 0.75] as const;

interface EaseStop {
  readonly input: number;
  readonly output: number;
}

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

function segmentError(
  ease: EaseFunction,
  left: EaseStop,
  right: EaseStop,
): number {
  return Math.max(
    ...ERROR_PROBES.map((fraction) => {
      const progress = left.input + (right.input - left.input) * fraction;
      const linearValue = left.output + (right.output - left.output) * fraction;
      return Math.abs(normalize(ease(progress)) - linearValue);
    }),
  );
}

function appendStops(
  ease: EaseFunction,
  left: EaseStop,
  right: EaseStop,
  depth: number,
  stops: EaseStop[],
): void {
  if (segmentError(ease, left, right) <= MAX_NORMALIZED_SEGMENT_ERROR) {
    if (stops.length >= MAX_EASING_STOPS)
      throw new Error("Native easing exceeded its finite stop bound.");
    stops.push(right);
    return;
  }
  if (depth >= MAX_SUBDIVISION_DEPTH)
    throw new Error("Native easing exceeded its finite subdivision bound.");
  const input = (left.input + right.input) / 2;
  const middle = { input, output: normalize(ease(input)) };
  appendStops(ease, left, middle, depth + 1, stops);
  appendStops(ease, middle, right, depth + 1, stops);
}

function sampleEase(ease: EaseFunction): string {
  const left = { input: 0, output: 0 },
    right = { input: 1, output: 1 };
  const points: EaseStop[] = [left];
  // Wide clip masks need precise curves, but uniform 512-interval strings
  // caused measured parser/effect setup regressions. Bound dense-test error
  // while retaining fewer stops on the flat tail; no per-frame JS sampling.
  appendStops(ease, left, right, 0, points);
  const stops = points.map(
    ({ input, output }) => `${serialize(output)} ${serialize(input * 100)}%`,
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
