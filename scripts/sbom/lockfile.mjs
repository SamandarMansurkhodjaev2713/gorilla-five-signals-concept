import { createHash } from "node:crypto";

import { compareCodePoints } from "./shared.mjs";

const SUPPORTED_LOCKFILE_VERSION = "9.0";
const PACKAGE_HEADER_PATTERN =
  /^ {2}(?:'(?<quoted>[^']+)'|(?<plain>[^ '\s][^:]*)):$/u;
const INTEGRITY_PATTERN =
  /^ {4}resolution: \{integrity: (?<integrity>sha512-[A-Za-z0-9+/=]+)(?:,.*)?\}$/u;

function normalizeSource(source) {
  return source.replace(/^\uFEFF/u, "").replace(/\r\n?/gu, "\n");
}

function packageIdentity(key) {
  const separator = key.lastIndexOf("@");
  if (separator <= 0 || separator === key.length - 1) {
    throw new Error(`Invalid pnpm package key: ${key}`);
  }
  const name = key.slice(0, separator);
  const version = key.slice(separator + 1);
  if (
    /\s/u.test(name) ||
    /\s/u.test(version) ||
    (name.startsWith("@") && !name.includes("/"))
  ) {
    throw new Error(`Invalid pnpm package identity: ${key}`);
  }
  return { key, name, version };
}

function integrityHex(integrity, key) {
  const encoded = integrity.slice("sha512-".length);
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.byteLength !== 64) {
    throw new Error(`${key} has an invalid SHA-512 integrity value.`);
  }
  return bytes.toString("hex");
}

function finalizePackage(record) {
  if (record.integrity === undefined) {
    throw new Error(
      `${record.key} has no SHA-512 integrity in pnpm-lock.yaml.`,
    );
  }
  return {
    ...packageIdentity(record.key),
    integrityHex: integrityHex(record.integrity, record.key),
  };
}

function packageSection(lines) {
  const start = lines.indexOf("packages:");
  const end = lines.indexOf("snapshots:");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "pnpm-lock.yaml must contain ordered packages and snapshots sections.",
    );
  }
  return lines.slice(start + 1, end);
}

function lockfileVersion(source) {
  const version = source.match(
    /^lockfileVersion: ['"]?(?<version>[^'"\n]+)['"]?$/mu,
  )?.groups?.version;
  if (version !== SUPPORTED_LOCKFILE_VERSION) {
    throw new Error(
      `Unsupported pnpm lockfile version: ${version ?? "missing"}.`,
    );
  }
}

function collectPackages(lines) {
  const packages = new Map();
  let activeRecord;
  for (const line of lines) {
    const header = line.match(PACKAGE_HEADER_PATTERN);
    if (header !== null) {
      if (activeRecord !== undefined) {
        const packageRecord = finalizePackage(activeRecord);
        packages.set(packageRecord.key, packageRecord);
      }
      const key = header.groups?.quoted ?? header.groups?.plain;
      if (key === undefined || packages.has(key)) {
        throw new Error(`Duplicate or invalid pnpm package key: ${key ?? ""}`);
      }
      activeRecord = { key };
      continue;
    }
    const integrity = line.match(INTEGRITY_PATTERN)?.groups?.integrity;
    if (activeRecord !== undefined && integrity !== undefined) {
      activeRecord.integrity = integrity;
    }
  }
  if (activeRecord !== undefined) {
    const packageRecord = finalizePackage(activeRecord);
    packages.set(packageRecord.key, packageRecord);
  }
  return packages;
}

export function parsePnpmLock(source) {
  const normalized = normalizeSource(source);
  lockfileVersion(normalized);
  const packages = collectPackages(packageSection(normalized.split("\n")));
  if (packages.size === 0) {
    throw new Error("pnpm-lock.yaml contains no resolved packages.");
  }
  return {
    lockfileSha256: createHash("sha256").update(normalized).digest("hex"),
    packages: [...packages.values()].toSorted((left, right) =>
      compareCodePoints(left.key, right.key),
    ),
  };
}
