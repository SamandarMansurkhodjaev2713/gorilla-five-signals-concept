import { readFile } from "node:fs/promises";
import path from "node:path";

import { createComponent, validateSbom } from "./sbom/cyclonedx.mjs";
import {
  createLicenseChoice,
  resolveLicensePolicy,
} from "./sbom/license-policy.mjs";
import { parsePnpmLock } from "./sbom/lockfile.mjs";
import { isRecord, readString } from "./sbom/shared.mjs";

const PROJECT_DIRECTORY = path.resolve(".");
const PACKAGE_PATH = path.join(PROJECT_DIRECTORY, "package.json");
const LOCKFILE_PATH = path.join(PROJECT_DIRECTORY, "pnpm-lock.yaml");
const REVIEWED_SBOM_PATH = path.join(
  PROJECT_DIRECTORY,
  "docs",
  "release",
  "SBOM.cdx.json",
);

function createDocument(rootPackage, lock, licenses) {
  const rootName = readString(rootPackage.name, "Application name");
  const rootVersion = readString(rootPackage.version, "Application version");
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: rootName,
        version: rootVersion,
      },
      properties: [
        {
          name: "gorilla:build:pnpm-lock-sha256",
          value: lock.lockfileSha256,
        },
      ],
    },
    components: lock.packages.map((packageRecord) =>
      createComponent(packageRecord, licenses.get(packageRecord.key)),
    ),
  };
}

export function createSbomFromSources({
  lockSource,
  reviewedSbom,
  rootPackage,
}) {
  if (!isRecord(rootPackage)) {
    throw new Error("package.json must contain an application record.");
  }
  const lock = parsePnpmLock(lockSource);
  const licenses = resolveLicensePolicy(lock.packages, reviewedSbom);
  return validateSbom(
    createDocument(rootPackage, lock, licenses),
    lock.lockfileSha256,
  );
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function createSbom() {
  const [lockSource, reviewedSbom, rootPackage] = await Promise.all([
    readFile(LOCKFILE_PATH, "utf8"),
    readJson(REVIEWED_SBOM_PATH),
    readJson(PACKAGE_PATH),
  ]);
  return createSbomFromSources({ lockSource, reviewedSbom, rootPackage });
}

export function serializeSbom(sbom) {
  return `${JSON.stringify(sbom, undefined, 2)}\n`;
}

export { createLicenseChoice, parsePnpmLock };
