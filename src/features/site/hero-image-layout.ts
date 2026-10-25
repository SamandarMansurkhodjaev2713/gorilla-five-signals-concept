import { HERO_CAN_ENVELOPE } from "@/motion/hero-can-spec";

const DEGREES_TO_RADIANS = Math.PI / 180;
export const HERO_GUTTER_EXPRESSION = "clamp(1rem, 0.65rem + 1.5vw, 2.5rem)";

interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

function nativeAspect({ width, height }: ImageDimensions): number {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      "Hero media requires positive, safe native pixel dimensions.",
    );
  }
  return width / height;
}

function maximumProjectedWidth(aspect: number): number {
  const angle = Math.min(
    Math.atan(1 / aspect),
    HERO_CAN_ENVELOPE.rotationDegrees * DEGREES_TO_RADIANS,
  );
  return aspect * Math.cos(angle) + Math.sin(angle);
}

function scaledHeight(height: string, aspect: number): string {
  return `calc(${height} * ${String(aspect)})`;
}

function responsiveSizes(aspect: number, projectedWidth: number): string {
  const cap = `calc((100vw - (2 * ${HERO_GUTTER_EXPRESSION})) * ${String(aspect)} / ${String(projectedWidth * HERO_CAN_ENVELOPE.scale)})`;
  const landscape = scaledHeight("28rem", aspect);
  const compact = `min(${scaledHeight("40svh", aspect)}, ${scaledHeight("25rem", aspect)})`;
  const mobile = `min(${scaledHeight("48svh", aspect)}, ${scaledHeight("25rem", aspect)})`;
  return [
    // A viewport envelope also covers enlarged root text without requiring JavaScript.
    `(max-width: 22rem) and (max-height: 45rem) and (orientation: landscape) ${cap}`,
    `(max-width: 22rem) min(${compact}, ${cap})`,
    `(max-height: 45rem) and (orientation: landscape) ${landscape}`,
    `(min-width: 64rem) min(${scaledHeight("63svh", aspect)}, ${scaledHeight("42rem", aspect)})`,
    `(min-width: 48rem) min(${scaledHeight("61svh", aspect)}, ${scaledHeight("38rem", aspect)})`,
    mobile,
  ].join(", ");
}

/** Native aspect and the authored motion envelope drive CSS framing and responsive sizes together. */
export function createHeroImageLayout(dimensions: ImageDimensions) {
  const aspect = nativeAspect(dimensions);
  const projectedWidth = maximumProjectedWidth(aspect);
  return Object.freeze({
    aspect,
    projectedWidth,
    sizes: responsiveSizes(aspect, projectedWidth),
  });
}
