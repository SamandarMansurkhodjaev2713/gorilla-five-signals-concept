import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const MEDIA_DIRECTORY = path.resolve("src/content/media");
const PUBLIC_DIRECTORY = path.resolve("public");
const GENERATED_MEDIA_DIRECTORY = path.join(
  PUBLIC_DIRECTORY,
  "media/generated",
);
const JSON_EXTENSION = ".json";
const REQUIRED_FIELDS = [
  "checksumSha256",
  "license",
  "mediaId",
  "owner",
  "path",
  "permissionEvidence",
  "territories",
];

async function collectJson(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(JSON_EXTENSION))
    .map((entry) => path.join(directory, entry.name));
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const location = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(location) : [location];
    }),
  );
  return nested.flat();
}

function missingFields(record) {
  return REQUIRED_FIELDS.filter((field) => {
    const value = record[field];
    return value === undefined || value === "" || value === null;
  });
}

function publicLocation(mediaPath) {
  return path.join(PUBLIC_DIRECTORY, mediaPath.replace(/^\/+/u, ""));
}

async function verifyChecksum(record) {
  const source = await readFile(publicLocation(record.path));
  const actual = createHash("sha256").update(source).digest("hex");
  return actual === record.checksumSha256
    ? undefined
    : `${record.mediaId}: checksum mismatch`;
}

async function verifyDerivativeChecksums(record) {
  if (!Array.isArray(record.derivatives)) {
    return [];
  }

  return Promise.all(
    record.derivatives.map(async (derivative) => {
      const source = await readFile(publicLocation(derivative.path));
      const actual = createHash("sha256").update(source).digest("hex");
      return actual === derivative.checksumSha256
        ? undefined
        : `${record.mediaId}: derivative checksum mismatch for ${derivative.path}`;
    }),
  );
}

function verifyExpiry(record, today) {
  if (record.rightsExpiresAt === undefined) {
    return undefined;
  }
  return record.rightsExpiresAt >= today
    ? undefined
    : `${record.mediaId}: rights expired on ${record.rightsExpiresAt}`;
}

async function verifyRecord(file, today) {
  let record;
  try {
    record = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid JSON";
    return { failures: [`${path.basename(file)}: ${message}`] };
  }
  const missing = missingFields(record);
  if (missing.length > 0) {
    return {
      failures: [`${path.basename(file)}: missing ${missing.join(", ")}`],
    };
  }

  const failures = [verifyExpiry(record, today)];
  try {
    failures.push(await verifyChecksum(record));
    failures.push(...(await verifyDerivativeChecksums(record)));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown read error";
    failures.push(`${record.mediaId}: ${message}`);
  }
  return {
    failures: failures.filter((failure) => failure !== undefined),
    record,
  };
}

const today = new Date().toISOString().slice(0, 10);
const records = await collectJson(MEDIA_DIRECTORY);
const results = await Promise.all(
  records.map((file) => verifyRecord(file, today)),
);
const failures = results.flatMap((result) => result.failures);
const registeredPaths = new Set(
  results
    .flatMap((result) => [
      result.record?.path,
      ...(Array.isArray(result.record?.derivatives)
        ? result.record.derivatives.map((derivative) => derivative.path)
        : []),
    ])
    .filter((mediaPath) => typeof mediaPath === "string"),
);
const generatedFiles = await collectFiles(GENERATED_MEDIA_DIRECTORY);

for (const file of generatedFiles) {
  const publicPath = `/${path.relative(PUBLIC_DIRECTORY, file).replaceAll("\\", "/")}`;
  if (!registeredPaths.has(publicPath)) {
    failures.push(`${publicPath}: generated media has no provenance record`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`Media provenance failures:\n${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Verified provenance for ${records.length} media record(s).\n`,
  );
}
