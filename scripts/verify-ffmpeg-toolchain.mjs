import ffmpegPath from "ffmpeg-static";

import { verifyApprovedFfmpegBinary } from "./ffmpeg-toolchain.mjs";

if (ffmpegPath === null) {
  throw new Error("ffmpeg-static did not provide a platform binary.");
}

const toolchain = await verifyApprovedFfmpegBinary(ffmpegPath);
process.stdout.write(
  `Verified ffmpeg-static@${toolchain.packageVersion}: ${toolchain.version} (${toolchain.buildHost}, ${toolchain.sha256}).\n`,
);
