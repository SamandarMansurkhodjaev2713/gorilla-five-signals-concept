import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSbom, serializeSbom } from "./sbom-core.mjs";

const OUTPUT_PATH = path.resolve("docs/release/SBOM.cdx.json");
const sbom = await createSbom();

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, serializeSbom(sbom), "utf8");
process.stdout.write(
  `Generated CycloneDX SBOM with ${String(sbom.components.length)} component(s).\n`,
);
