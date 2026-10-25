import { Buffer } from "node:buffer";

export const MATERIAL_GRAIN_SPEC = Object.freeze({
  width: 96,
  height: 96,
  channels: 4,
  seed: 0x6e786d6a,
  opaqueByteCeiling: 85,
  maximumChannel: 255,
});
export const MATERIAL_GRAIN_PNG_OPTIONS = Object.freeze({
  compressionLevel: 9,
  palette: false,
});
export const MATERIAL_GRAIN_BYTE_BUDGET = 12 * 1024;

const XORSHIFT = Object.freeze({ firstLeft: 13, right: 17, secondLeft: 5 });
const ALPHA_SHIFT = 24;
const COLOR_CHANNEL_COUNT = 3;

function nextNoiseState(state) {
  // Intentional modulo-2^32 arithmetic, for reproducible decoration, never security.
  let next = (state ^ (state << XORSHIFT.firstLeft)) >>> 0;
  next = (next ^ (next >>> XORSHIFT.right)) >>> 0;
  return (next ^ (next << XORSHIFT.secondLeft)) >>> 0;
}

/** Produce independent RGBA bytes without clock, platform randomness or source artwork. */
export function createMaterialGrainPixels() {
  const spec = MATERIAL_GRAIN_SPEC;
  const pixels = Buffer.alloc(spec.width * spec.height * spec.channels);
  let state = spec.seed;
  for (let offset = 0; offset < pixels.length; offset += spec.channels) {
    state = nextNoiseState(state);
    const opaque = state >>> ALPHA_SHIFT < spec.opaqueByteCeiling;
    const tone = opaque && (state & 1) !== 0 ? spec.maximumChannel : 0;
    pixels.fill(tone, offset, offset + COLOR_CHANNEL_COUNT);
    pixels[offset + COLOR_CHANNEL_COUNT] = opaque ? spec.maximumChannel : 0;
  }
  return pixels;
}
