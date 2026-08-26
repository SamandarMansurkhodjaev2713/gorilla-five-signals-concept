import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

const KIBIBYTE = 1024;
const FIRST_VIEW_FONT_LIMIT = 140 * KIBIBYTE;
const REQUIRED_BUDGET_HEADROOM = 0.1;
const FONT_SOURCE_VERSION = "5.3.0";
const PACKAGE_ROOT = "node_modules/@fontsource-variable";
const TYPOGRAPHY_PATH = "src/styles/typography.css";
const MANIFEST_PATH = "public/fonts/font-manifest.json";
const ARTIFACTS = Object.freeze({
  "public/fonts/licenses/Onest-OFL.txt": `${PACKAGE_ROOT}/onest/LICENSE`,
  "public/fonts/licenses/Oswald-OFL.txt": `${PACKAGE_ROOT}/oswald/LICENSE`,
  "public/fonts/onest/onest-cyrillic-variable.woff2": `${PACKAGE_ROOT}/onest/files/onest-cyrillic-wght-normal.woff2`,
  "public/fonts/onest/onest-latin-variable.woff2": `${PACKAGE_ROOT}/onest/files/onest-latin-wght-normal.woff2`,
  "public/fonts/oswald/oswald-cyrillic-variable.woff2": `${PACKAGE_ROOT}/oswald/files/oswald-cyrillic-wght-normal.woff2`,
  "public/fonts/oswald/oswald-latin-variable.woff2": `${PACKAGE_ROOT}/oswald/files/oswald-latin-wght-normal.woff2`,
});

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

async function inspectArtifact(outputPath, sourcePath) {
  const [output, source] = await Promise.all([
    readFile(path.resolve(outputPath)),
    readFile(path.resolve(sourcePath)),
  ]);
  return {
    bytes: output.byteLength,
    matches: sha256(output) === sha256(source),
    path: outputPath,
    sha256: sha256(output),
  };
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return nested
    .flat()
    .map((file) => file.replaceAll("\\", "/"))
    .sort();
}

function extractFontUrls(css) {
  return [...css.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/gu)].map(
    (match) => `public${match[1]}`,
  );
}

const results = await Promise.all(
  Object.entries(ARTIFACTS).map(([outputPath, sourcePath]) =>
    inspectArtifact(outputPath, sourcePath),
  ),
);
const [
  actualFiles,
  typographyCss,
  manifestContents,
  onestPackage,
  oswaldPackage,
] = await Promise.all([
  listFiles("public/fonts"),
  readFile(TYPOGRAPHY_PATH, "utf8"),
  readFile(MANIFEST_PATH, "utf8"),
  readFile(`${PACKAGE_ROOT}/onest/package.json`, "utf8").then(JSON.parse),
  readFile(`${PACKAGE_ROOT}/oswald/package.json`, "utf8").then(JSON.parse),
]);
const allowedFiles = [...Object.keys(ARTIFACTS), MANIFEST_PATH].sort();
const fontUrls = extractFontUrls(typographyCss);
const bytesByPath = new Map(
  results.map((result) => [result.path, result.bytes]),
);
const latinBytes =
  (bytesByPath.get("public/fonts/onest/onest-latin-variable.woff2") ?? 0) +
  (bytesByPath.get("public/fonts/oswald/oswald-latin-variable.woff2") ?? 0);
const cyrillicBytes =
  latinBytes +
  (bytesByPath.get("public/fonts/onest/onest-cyrillic-variable.woff2") ?? 0) +
  (bytesByPath.get("public/fonts/oswald/oswald-cyrillic-variable.woff2") ?? 0);
const localeTotals = { cyrillic: cyrillicBytes, latin: latinBytes };
const failures = results
  .filter((result) => !result.matches)
  .map((result) => `${result.path}: differs from pinned package source`);
const resultByPath = new Map(results.map((result) => [result.path, result]));
const expectedManifest = {
  artifacts: Object.entries(ARTIFACTS)
    .map(([outputPath, sourcePath]) => {
      const family = sourcePath.includes("/onest/") ? "onest" : "oswald";
      const inspected = resultByPath.get(outputPath);
      if (inspected === undefined) {
        throw new Error(`${outputPath}: missing inspection result`);
      }
      return {
        bytes: inspected.bytes,
        family,
        output: outputPath.replace("public/fonts/", ""),
        sha256: inspected.sha256,
        source: sourcePath.split(`/${family}/`)[1],
        version: FONT_SOURCE_VERSION,
      };
    })
    .sort((left, right) => left.output.localeCompare(right.output)),
  generator: "scripts/build-fonts.py",
  schemaVersion: 1,
};

if (JSON.stringify(actualFiles) !== JSON.stringify(allowedFiles)) {
  failures.push("public/fonts contains missing, stale, or extra artifacts");
}
for (const fontUrl of fontUrls) {
  if (!(fontUrl in ARTIFACTS)) {
    failures.push(`${fontUrl}: CSS references an unapproved font artifact`);
  }
}
for (const artifactPath of Object.keys(ARTIFACTS).filter((file) =>
  file.endsWith(".woff2"),
)) {
  if (!fontUrls.includes(artifactPath)) {
    failures.push(
      `${artifactPath}: shipped font is not referenced by typography CSS`,
    );
  }
}
if (/https?:\/\//u.test(typographyCss)) {
  failures.push("Typography CSS contains an external font origin");
}
for (const [family, metadata] of [
  ["onest", onestPackage],
  ["oswald", oswaldPackage],
]) {
  if (metadata.version !== FONT_SOURCE_VERSION) {
    failures.push(
      `${family}: expected package ${FONT_SOURCE_VERSION}, received ${String(metadata.version)}`,
    );
  }
}
for (const [localeGroup, bytes] of Object.entries(localeTotals)) {
  if (bytes > FIRST_VIEW_FONT_LIMIT * (1 - REQUIRED_BUDGET_HEADROOM)) {
    failures.push(
      `${localeGroup}: ${bytes} bytes leaves insufficient budget headroom`,
    );
  }
}
let manifest;
try {
  manifest = JSON.parse(manifestContents);
} catch (error) {
  failures.push(
    `font manifest is invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
  );
}
if (manifest !== undefined && !isDeepStrictEqual(manifest, expectedManifest)) {
  failures.push("font manifest differs from the exact generated contract");
}

process.stdout.write(
  `${JSON.stringify(
    {
      artifacts: results,
      firstViewBudget: FIRST_VIEW_FONT_LIMIT,
      localeTotals,
      requiredHeadroom: REQUIRED_BUDGET_HEADROOM,
    },
    undefined,
    2,
  )}\n`,
);
if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
}
