import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

import {
  normalizeDeploymentBase,
  withoutDeploymentBase,
} from "./deployment-base.mjs";

const BUILD_DIRECTORY = path.resolve("dist");
const HTML_EXTENSION = ".html";
const INITIAL_JAVASCRIPT_GZIP_LIMIT = 90 * 1024;
const INITIAL_TRANSFER_GZIP_LIMIT = 900 * 1024;
const SCRIPT_PATTERN = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/giu;
const STYLESHEET_PATTERN =
  /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/giu;
const DEPLOYMENT_BASE = normalizeDeploymentBase(process.env.PUBLIC_BASE_PATH);

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const location = path.join(directory, entry.name);
      return entry.isDirectory()
        ? collectHtml(location)
        : entry.name.endsWith(HTML_EXTENSION)
          ? [location]
          : [];
    }),
  );
  return files.flat();
}

function extractLocalAssets(html, pattern) {
  return Array.from(html.matchAll(pattern), (match) => match[1])
    .filter((value) => value !== undefined)
    .filter((value) => value.startsWith("/"))
    .map((value) => value.split(/[?#]/u, 1)[0])
    .filter((value) => value !== undefined);
}

function resolveAsset(reference) {
  const applicationPath = withoutDeploymentBase(reference, DEPLOYMENT_BASE);
  return path.join(BUILD_DIRECTORY, applicationPath.replace(/^\/+/u, ""));
}

async function gzipSize(location) {
  const source = await readFile(location);
  return gzipSync(source).byteLength;
}

async function measurePage(htmlPath) {
  const html = await readFile(htmlPath, "utf8");
  const scripts = new Set(extractLocalAssets(html, SCRIPT_PATTERN));
  const styles = new Set(extractLocalAssets(html, STYLESHEET_PATTERN));
  const javascript = await Promise.all(
    [...scripts].map((item) => gzipSize(resolveAsset(item))),
  );
  const stylesheets = await Promise.all(
    [...styles].map((item) => gzipSize(resolveAsset(item))),
  );
  const documentSize = gzipSync(html).byteLength;

  return {
    document: path.relative(BUILD_DIRECTORY, htmlPath),
    initialJavaScriptGzip: javascript.reduce((total, size) => total + size, 0),
    initialTransferGzip:
      documentSize +
      javascript.reduce((total, size) => total + size, 0) +
      stylesheets.reduce((total, size) => total + size, 0),
  };
}

function budgetFailures(measurement) {
  const failures = [];
  if (measurement.initialJavaScriptGzip > INITIAL_JAVASCRIPT_GZIP_LIMIT) {
    failures.push(
      `${measurement.document}: initial JavaScript budget exceeded`,
    );
  }
  if (measurement.initialTransferGzip > INITIAL_TRANSFER_GZIP_LIMIT) {
    failures.push(`${measurement.document}: initial transfer budget exceeded`);
  }
  return failures;
}

await stat(BUILD_DIRECTORY);
const pages = await collectHtml(BUILD_DIRECTORY);
const measurements = await Promise.all(pages.map(measurePage));
const failures = measurements.flatMap(budgetFailures);
process.stdout.write(
  `${JSON.stringify(
    {
      limits: {
        initialJavaScriptGzip: INITIAL_JAVASCRIPT_GZIP_LIMIT,
        initialTransferGzip: INITIAL_TRANSFER_GZIP_LIMIT,
      },
      pages: measurements,
    },
    undefined,
    2,
  )}\n`,
);

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
}
