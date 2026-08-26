import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

import { verifyApprovedFfmpegBinary } from "./ffmpeg-toolchain.mjs";

const FRAME_RATE = 15;
const DURATION_SECONDS = 6;
const FRAME_COUNT = FRAME_RATE * DURATION_SECONDS;
const OUTPUT_DIRECTORY = path.resolve("public/media/generated/film");
const PRODUCT_DIRECTORY = path.resolve("public/media/generated/products");
const PRODUCT_SLUGS = [
  "original",
  "zero",
  "extra",
  "mango-coconut",
  "lychee-pear",
];
const SIGNAL_COLORS = ["#92d400", "#969696", "#8d745a", "#f5b01d", "#ff3e6f"];
const FILM_VARIANTS = [
  {
    canHeight: 470,
    height: 720,
    name: "desktop",
    width: 1_280,
  },
  {
    canHeight: 520,
    height: 1_280,
    name: "mobile",
    width: 720,
  },
];
const FFMPEG_TIMEOUT_MS = 180_000;

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function createBackgroundSvg({ height, phase, width }) {
  const bars = SIGNAL_COLORS.map((color, index) => {
    const travel = (phase * width + index * width * 0.27) % (width * 1.5);
    const x = travel - width * 0.25;
    return `<rect x="${x.toFixed(2)}" y="-${height * 0.2}" width="${(
      width * 0.075
    ).toFixed(2)}" height="${height * 1.4}" fill="${escapeXml(
      color,
    )}" opacity="0.16" transform="rotate(12 ${width / 2} ${height / 2})"/>`;
  }).join("");
  const droplets = Array.from({ length: 18 }, (_, index) => {
    const x = ((index * 97 + 41) % width) + Math.sin(phase * Math.PI * 2) * 6;
    const y = (index * 173 + 79) % height;
    const radius = 2 + (index % 4);
    return `<circle cx="${x.toFixed(2)}" cy="${String(y)}" r="${String(
      radius,
    )}" fill="none" stroke="#f4f4ed" stroke-opacity="0.16"/>`;
  }).join("");

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}">
      <defs>
        <radialGradient id="light" cx="${String(48 + Math.sin(phase * Math.PI * 2) * 8)}%" cy="44%" r="62%">
          <stop offset="0" stop-color="#263324"/>
          <stop offset="0.48" stop-color="#0b0d0b"/>
          <stop offset="1" stop-color="#010201"/>
        </radialGradient>
        <pattern id="brush" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 1H8M0 5H8" stroke="#f4f4ed" stroke-opacity="0.025" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#light)"/>
      <rect width="100%" height="100%" fill="url(#brush)"/>
      ${bars}
      ${droplets}
      <rect x="1" y="1" width="${String(width - 2)}" height="${String(
        height - 2,
      )}" fill="none" stroke="#777e75" stroke-opacity="0.38"/>
    </svg>
  `);
}

async function prepareCans(canHeight) {
  return Promise.all(
    PRODUCT_SLUGS.map(async (slug) => {
      const inputPath = path.join(PRODUCT_DIRECTORY, `can-${slug}-480.webp`);
      const buffer = await sharp(inputPath)
        .resize({ height: canHeight, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer({ resolveWithObject: true });
      return {
        height: buffer.info.height,
        input: buffer.data,
        width: buffer.info.width,
      };
    }),
  );
}

function createCanComposites(cans, variant, phase) {
  const spacing =
    variant.name === "desktop"
      ? variant.width / (cans.length + 0.6)
      : variant.width / (cans.length + 0.25);
  const baseline =
    variant.name === "desktop" ? variant.height * 0.84 : variant.height * 0.72;

  return cans.map((can, index) => {
    const wave =
      Math.sin(phase * Math.PI * 2 + index * 0.72) *
      (variant.name === "desktop" ? 18 : 24);
    const left = Math.round(
      spacing * (index + 0.3) + (spacing - can.width) / 2,
    );
    const top = Math.round(baseline - can.height + wave);
    return { input: can.input, left, top };
  });
}

async function createFrame(variant, cans, frameIndex) {
  const phase = frameIndex / (FRAME_COUNT - 1);
  const background = createBackgroundSvg({
    height: variant.height,
    phase,
    width: variant.width,
  });

  return sharp(background)
    .composite(createCanComposites(cans, variant, phase))
    .removeAlpha()
    .raw()
    .toBuffer();
}

function createFfmpegArguments(variant) {
  const baseName = `material-film-${variant.name}`;
  const mp4Path = path.join(OUTPUT_DIRECTORY, `${baseName}.mp4`);
  const webmPath = path.join(OUTPUT_DIRECTORY, `${baseName}.webm`);

  return [
    "-y",
    "-f",
    "rawvideo",
    "-pixel_format",
    "rgb24",
    "-video_size",
    `${String(variant.width)}x${String(variant.height)}`,
    "-framerate",
    String(FRAME_RATE),
    "-i",
    "pipe:0",
    "-an",
    "-map_metadata",
    "-1",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "27",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-threads",
    "2",
    mp4Path,
    "-an",
    "-map_metadata",
    "-1",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "38",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-row-mt",
    "1",
    "-threads",
    "2",
    webmPath,
  ];
}

async function encodeVariant(variant) {
  const cans = await prepareCans(variant.canHeight);
  const child = spawn(ffmpegPath, createFfmpegArguments(variant), {
    shell: false,
    stdio: ["pipe", "ignore", "pipe"],
  });
  const stderrChunks = [];
  const timeoutId = setTimeout(() => child.kill(), FFMPEG_TIMEOUT_MS);
  child.stderr.on("data", (chunk) => stderrChunks.push(chunk));

  try {
    let posterFrame;
    for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
      const frame = await createFrame(variant, cans, frameIndex);
      posterFrame ??= frame;
      if (!child.stdin.write(frame)) {
        await once(child.stdin, "drain");
      }
    }
    child.stdin.end();

    const [exitCode] = await once(child, "exit");
    if (exitCode !== 0) {
      throw new Error(
        `FFmpeg failed for ${variant.name}: ${Buffer.concat(
          stderrChunks,
        ).toString("utf8")}`,
      );
    }

    const poster = sharp(posterFrame, {
      raw: {
        channels: 3,
        height: variant.height,
        width: variant.width,
      },
    });
    const posterBase = path.join(
      OUTPUT_DIRECTORY,
      `material-film-${variant.name}-poster`,
    );
    await Promise.all([
      poster
        .clone()
        .avif({ effort: 6, quality: 52 })
        .toFile(`${posterBase}.avif`),
      poster
        .clone()
        .webp({ effort: 6, quality: 82 })
        .toFile(`${posterBase}.webp`),
      poster
        .clone()
        .jpeg({ mozjpeg: true, quality: 86 })
        .toFile(`${posterBase}.jpg`),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

if (ffmpegPath === null) {
  throw new Error("ffmpeg-static did not provide a platform binary.");
}
const ffmpegToolchain = await verifyApprovedFfmpegBinary(ffmpegPath);

await rm(OUTPUT_DIRECTORY, { force: true, recursive: true });
await mkdir(OUTPUT_DIRECTORY, { recursive: true });

for (const variant of FILM_VARIANTS) {
  await encodeVariant(variant);
}

process.stdout.write(
  `Built ${String(FILM_VARIANTS.length)} product-film variants at ${String(
    FRAME_RATE,
  )} fps with verified FFmpeg ${ffmpegToolchain.version} (${ffmpegToolchain.buildHost}).\n`,
);
