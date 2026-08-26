import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  normalizeDeploymentBase,
  withoutDeploymentBase,
} from "./deployment-base.mjs";

const BUILD_DIRECTORY = path.resolve("dist");
const HTML_EXTENSION = ".html";
const ATTRIBUTE_PATTERN = /\b(?:href|src)=["']([^"'<>]+)["']/giu;
const ID_PATTERN = /\bid=["']([^"'<>]+)["']/giu;
const IGNORED_PROTOCOL_PATTERN =
  /^(?:data:|mailto:|tel:|https?:|javascript:)/iu;
const DEPLOYMENT_BASE = normalizeDeploymentBase(process.env.PUBLIC_BASE_PATH);

async function collectFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const location = path.join(directory, entry.name);
      return entry.isDirectory()
        ? collectFiles(location, extension)
        : entry.name.endsWith(extension)
          ? [location]
          : [];
    }),
  );
  return nested.flat();
}

function extractMatches(source, pattern) {
  return Array.from(source.matchAll(pattern), (match) => match[1]).filter(
    (value) => value !== undefined,
  );
}

function resolveCandidate(documentPath, referencePath) {
  const cleanPath = withoutDeploymentBase(
    decodeURIComponent(referencePath),
    DEPLOYMENT_BASE,
  );
  const base = cleanPath.startsWith("/")
    ? BUILD_DIRECTORY
    : path.dirname(documentPath);
  return path.resolve(base, cleanPath.replace(/^\/+/u, ""));
}

async function findExistingTarget(candidate) {
  const candidates = path.extname(candidate)
    ? [candidate]
    : [
        candidate,
        `${candidate}${HTML_EXTENSION}`,
        path.join(candidate, "index.html"),
      ];

  for (const location of candidates) {
    try {
      await stat(location);
      return location;
    } catch (error) {
      if (isMissingPathError(error)) {
        continue;
      }
      throw error;
    }
  }

  return undefined;
}

function isMissingPathError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function staysWithinBuild(candidate) {
  const relative = path.relative(BUILD_DIRECTORY, candidate);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function verifyReference(documentPath, reference) {
  if (IGNORED_PROTOCOL_PATTERN.test(reference)) {
    return undefined;
  }

  const [pathWithQuery = "", fragment] = reference.split("#", 2);
  const [referencePath = ""] = pathWithQuery.split("?", 1);
  const candidate =
    referencePath === ""
      ? documentPath
      : resolveCandidate(documentPath, referencePath);
  if (!staysWithinBuild(candidate)) {
    return `${path.relative(BUILD_DIRECTORY, documentPath)} → escaped build root: ${reference}`;
  }
  const target = await findExistingTarget(candidate);

  if (target === undefined) {
    return `${path.relative(BUILD_DIRECTORY, documentPath)} → ${reference}`;
  }

  if (fragment === undefined || fragment === "") {
    return undefined;
  }

  const targetHtml = await readFile(target, "utf8");
  const ids = new Set(extractMatches(targetHtml, ID_PATTERN));
  return ids.has(decodeURIComponent(fragment))
    ? undefined
    : `${path.relative(BUILD_DIRECTORY, documentPath)} → missing #${fragment}`;
}

async function verifyDocument(documentPath) {
  const html = await readFile(documentPath, "utf8");
  const references = extractMatches(html, ATTRIBUTE_PATTERN);
  return Promise.all(
    references.map((reference) => verifyReference(documentPath, reference)),
  );
}

const documents = await collectFiles(BUILD_DIRECTORY, HTML_EXTENSION);
const failures = (await Promise.all(documents.map(verifyDocument)))
  .flat()
  .filter((failure) => failure !== undefined);

if (failures.length > 0) {
  process.stderr.write(`Broken internal references:\n${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Verified internal links in ${documents.length} HTML file(s).\n`,
  );
}
