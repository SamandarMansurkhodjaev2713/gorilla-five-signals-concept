import { readFile } from "node:fs/promises";
import path from "node:path";

import { createSbom, serializeSbom } from "./sbom-core.mjs";

const SBOM_PATH = path.resolve("docs/release/SBOM.cdx.json");
const [expected, actual] = await Promise.all([
  createSbom().then(serializeSbom),
  readFile(SBOM_PATH, "utf8"),
]);

if (actual !== expected) {
  throw new Error(
    "The committed SBOM is stale. Run `pnpm generate:sbom` and review the license delta.",
  );
}

const componentCount = JSON.parse(actual).components.length;
process.stdout.write(
  `Verified CycloneDX SBOM and approved licenses for ${String(componentCount)} component(s).\n`,
);
