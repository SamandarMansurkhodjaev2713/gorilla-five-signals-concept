import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { arch, platform } from "node:os";

export const FFMPEG_PACKAGE_VERSION = "5.3.0";
export const APPROVED_FFMPEG_BINARIES = Object.freeze({
  "win32-x64": Object.freeze({
    sha256: "04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00",
    version: "6.1.1-essentials_build-www.gyan.dev",
  }),
});

async function calculateSha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

export async function verifyApprovedFfmpegBinary(
  binaryPath,
  buildHost = `${platform()}-${arch()}`,
) {
  const approved = APPROVED_FFMPEG_BINARIES[buildHost];
  if (approved === undefined) {
    throw new Error(
      `Product-film generation is not approved on build host ${buildHost}.`,
    );
  }
  const actualSha256 = await calculateSha256(binaryPath);
  if (actualSha256 !== approved.sha256) {
    throw new Error(
      `ffmpeg-static@${FFMPEG_PACKAGE_VERSION} binary verification failed for ${buildHost}.`,
    );
  }
  return { ...approved, buildHost, packageVersion: FFMPEG_PACKAGE_VERSION };
}
