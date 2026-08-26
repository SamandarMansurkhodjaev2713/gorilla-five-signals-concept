import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const SOURCE_DIRECTORY = path.resolve("src/assets/brand");
const OUTPUT_DIRECTORY = path.resolve("public/media/generated");
const PRODUCT_OUTPUT_WIDTH = 640;
const LOGO_OUTPUT_WIDTH = 520;
const PRODUCT_VARIANT_WIDTHS = [320, 480, PRODUCT_OUTPUT_WIDTH];
const LOGO_VARIANT_WIDTHS = [96, 192, LOGO_OUTPUT_WIDTH];
const WEBP_QUALITY = 90;
const WEBP_ALPHA_QUALITY = 100;

const PRODUCT_ASSETS = [
  {
    source: "can-original.png",
    outputStem: "products/can-original",
  },
  {
    source: "can-zero.png",
    outputStem: "products/can-zero",
  },
  {
    source: "can-extra.png",
    outputStem: "products/can-extra",
  },
  {
    source: "can-mango-coconut.png",
    outputStem: "products/can-mango-coconut",
  },
  {
    source: "can-lychee-pear.png",
    outputStem: "products/can-lychee-pear",
  },
];
const ASSETS = [
  ...PRODUCT_ASSETS.flatMap((asset) =>
    PRODUCT_VARIANT_WIDTHS.map((width) => ({
      output:
        width === PRODUCT_OUTPUT_WIDTH
          ? `${asset.outputStem}.webp`
          : `${asset.outputStem}-${String(width)}.webp`,
      source: asset.source,
      width,
    })),
  ),
  ...LOGO_VARIANT_WIDTHS.map((width) => ({
    output:
      width === LOGO_OUTPUT_WIDTH
        ? "brand/gorilla-logo.webp"
        : `brand/gorilla-logo-${String(width)}.webp`,
    source: "gorilla-logo.png",
    width,
  })),
];

async function buildAsset(asset) {
  const sourcePath = path.join(SOURCE_DIRECTORY, asset.source);
  const outputPath = path.join(OUTPUT_DIRECTORY, asset.output);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(sourcePath)
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({
      alphaQuality: WEBP_ALPHA_QUALITY,
      effort: 6,
      quality: WEBP_QUALITY,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const output = await readFile(outputPath);
  return {
    bytes: output.byteLength,
    checksumSha256: createHash("sha256").update(output).digest("hex"),
    path: `/${path.relative(path.resolve("public"), outputPath).replaceAll("\\", "/")}`,
  };
}

const manifest = Object.fromEntries(
  await Promise.all(
    ASSETS.map(async (asset) => [asset.output, await buildAsset(asset)]),
  ),
);

process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
