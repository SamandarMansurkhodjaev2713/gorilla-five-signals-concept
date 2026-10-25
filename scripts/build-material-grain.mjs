import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  createMaterialGrainPixels,
  MATERIAL_GRAIN_BYTE_BUDGET,
  MATERIAL_GRAIN_PNG_OPTIONS,
  MATERIAL_GRAIN_SPEC,
} from "./material-grain-core.mjs";

const PUBLIC_ASSET_PATH = "/media/generated/material/material-grain-v1.png";
const OUTPUT_PATH = path.resolve(`public${PUBLIC_ASSET_PATH}`);
const pixels = createMaterialGrainPixels();
const { width, height, channels } = MATERIAL_GRAIN_SPEC;
const image = await sharp(pixels, { raw: { width, height, channels } })
  .png(MATERIAL_GRAIN_PNG_OPTIONS)
  .toBuffer();
if (image.byteLength > MATERIAL_GRAIN_BYTE_BUDGET) {
  throw new Error("Material grain exceeds its compressed asset budget.");
}
await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, image);
process.stdout.write(
  `${JSON.stringify({
    path: PUBLIC_ASSET_PATH,
    bytes: image.byteLength,
    checksumSha256: createHash("sha256").update(image).digest("hex"),
    rgbaSha256: createHash("sha256").update(pixels).digest("hex"),
    decodedBytes: pixels.byteLength,
    sharp: sharp.versions.sharp,
    vips: sharp.versions.vips,
    specification: MATERIAL_GRAIN_SPEC,
  })}\n`,
);
