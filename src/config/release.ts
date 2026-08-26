import type { PublicEnvironment } from "./environment";

type ReleaseMode = PublicEnvironment["releaseMode"];

const PRIVATE_ROBOTS_META = "noindex, nofollow, noarchive";
const PUBLIC_ROBOTS_META = "index, follow";
const PRIVATE_ROBOTS_FILE = "User-agent: *\nDisallow: /\n";
const PUBLIC_ROBOTS_FILE = "User-agent: *\nAllow: /\n";

export function createRobotsMeta(releaseMode: ReleaseMode): string {
  return releaseMode === "public" ? PUBLIC_ROBOTS_META : PRIVATE_ROBOTS_META;
}

export function createRobotsFile(releaseMode: ReleaseMode): string {
  return releaseMode === "public" ? PUBLIC_ROBOTS_FILE : PRIVATE_ROBOTS_FILE;
}
