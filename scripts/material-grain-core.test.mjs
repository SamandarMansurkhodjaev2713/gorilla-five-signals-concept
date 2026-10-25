import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import sharp from "sharp";

import {
  createMaterialGrainPixels,
  MATERIAL_GRAIN_BYTE_BUDGET,
  MATERIAL_GRAIN_PNG_OPTIONS,
  MATERIAL_GRAIN_SPEC,
} from "./material-grain-core.mjs";

const EXPECTED_RGBA_SHA256 =
  "45531b0ecda4b64b54eea7a584e3746935d06a95726a97125c7b19654f0d65df";
const COLOR_CHANNELS = 3;
const BALANCE_TOLERANCE = 0.03;

function encodeGrain() {
  const { width, height, channels } = MATERIAL_GRAIN_SPEC;
  return sharp(createMaterialGrainPixels(), {
    raw: { width, height, channels },
  })
    .png(MATERIAL_GRAIN_PNG_OPTIONS)
    .toBuffer();
}

test("GIVEN fixed grain policy WHEN pixels are generated THEN the pinned RGBA digest and dimensions remain reproducible", () => {
  const pixels = createMaterialGrainPixels();
  const { width, height, channels } = MATERIAL_GRAIN_SPEC;
  assert.equal(pixels.byteLength, width * height * channels);
  assert.equal(
    createHash("sha256").update(pixels).digest("hex"),
    EXPECTED_RGBA_SHA256,
  );
  assert.ok(Object.isFrozen(MATERIAL_GRAIN_SPEC));
});

test("GIVEN repeated generation WHEN one output is changed THEN later outputs remain independent", () => {
  const first = createMaterialGrainPixels();
  const before = Buffer.from(first);
  first[0] ^= MATERIAL_GRAIN_SPEC.maximumChannel;
  assert.notDeepEqual(first, before);
  assert.deepEqual(createMaterialGrainPixels(), before);
});

test("GIVEN generated texture WHEN alpha and neutral tones are counted THEN coverage is sparse and balanced without tint", () => {
  const pixels = createMaterialGrainPixels();
  const spec = MATERIAL_GRAIN_SPEC;
  const tones = new Map();
  let opaque = 0;
  let white = 0;
  for (let offset = 0; offset < pixels.length; offset += spec.channels) {
    const tone = pixels[offset];
    const alpha = pixels[offset + COLOR_CHANNELS];
    assert.equal(pixels[offset + 1], tone);
    assert.equal(pixels[offset + 2], tone);
    tones.set(`${tone}/${alpha}`, true);
    if (alpha === spec.maximumChannel) {
      opaque += 1;
      if (tone === spec.maximumChannel) white += 1;
    }
  }
  assert.deepEqual([...tones.keys()].sort(), ["0/0", "0/255", "255/255"]);
  assert.ok(
    Math.abs(opaque / (spec.width * spec.height) - 1 / 3) < BALANCE_TOLERANCE,
  );
  assert.ok(Math.abs(white / opaque - 1 / 2) < BALANCE_TOLERANCE);
});

test("GIVEN pinned PNG policy WHEN encoded twice THEN bytes match within budget and preserve RGBA transparency", async () => {
  const first = await encodeGrain();
  assert.deepEqual(await encodeGrain(), first);
  assert.ok(first.byteLength <= MATERIAL_GRAIN_BYTE_BUDGET);
  const metadata = await sharp(first).metadata();
  assert.equal(metadata.width, MATERIAL_GRAIN_SPEC.width);
  assert.equal(metadata.height, MATERIAL_GRAIN_SPEC.height);
  assert.equal(metadata.channels, MATERIAL_GRAIN_SPEC.channels);
  assert.equal(metadata.hasAlpha, true);
});
