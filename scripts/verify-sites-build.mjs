import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST_DIRECTORY = path.resolve("dist");
const CLIENT_DIRECTORY = path.join(DIST_DIRECTORY, "client");
const WORKER_PATH = path.join(DIST_DIRECTORY, "server", "index.js");
const HOSTING_PATH = path.join(DIST_DIRECTORY, ".openai", "hosting.json");
const HOSTING_SOURCE = path.resolve(".openai", "hosting.json");
const EXPECTED_DIST_ENTRIES = [".openai", "client", "server"];
const SECURITY_HEADER = "Content-Security-Policy";
const TRANSPORT_SECURITY_HEADER = "Strict-Transport-Security";
const DOCUMENT_CACHE_POLICY = "public, max-age=0, must-revalidate";
const IMMUTABLE_CACHE_POLICY = "public, max-age=31536000, immutable";
const REVALIDATED_ASSET_CACHE_POLICY =
  "public, max-age=86400, stale-while-revalidate=604800";

await Promise.all([
  access(CLIENT_DIRECTORY),
  access(WORKER_PATH),
  access(HOSTING_PATH),
]);

const distEntries = (await readdir(DIST_DIRECTORY)).sort();
assert.deepEqual(
  distEntries,
  EXPECTED_DIST_ENTRIES,
  "The Sites artifact must not retain a duplicate static tree in dist.",
);
assert.deepEqual(
  JSON.parse(await readFile(HOSTING_PATH, "utf8")),
  JSON.parse(await readFile(HOSTING_SOURCE, "utf8")),
  "The packaged hosting metadata must exactly match the source contract.",
);

const workerUrl = pathToFileURL(WORKER_PATH);
workerUrl.searchParams.set("verification", String(Date.now()));
const { default: worker } = await import(workerUrl.href);
assert.equal(typeof worker?.fetch, "function");
const assetRequests = [];
const environment = {
  ASSETS: {
    fetch: (request) => {
      assetRequests.push(request.url);
      return Promise.resolve(
        new Response("<!doctype html><title>Verified</title>", {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
      );
    },
  },
};

const redirect = await worker.fetch(
  new Request("https://example.test/?campaign=launch&flavor=zero"),
  environment,
);
assert.equal(redirect.status, 308);
assert.equal(
  redirect.headers.get("location"),
  "https://example.test/uz/?campaign=launch&flavor=zero",
);
assert.ok(redirect.headers.has(SECURITY_HEADER));
assert.ok(redirect.headers.has(TRANSPORT_SECURITY_HEADER));

const faviconRedirect = await worker.fetch(
  new Request("https://example.test/favicon.ico"),
  environment,
);
assert.equal(faviconRedirect.status, 308);
assert.equal(
  faviconRedirect.headers.get("location"),
  "https://example.test/favicon.svg",
);
assert.equal(assetRequests.length, 0);

const page = await worker.fetch(
  new Request("https://example.test/uz/"),
  environment,
);
assert.equal(page.status, 200);
assert.equal(assetRequests.length, 1);
assert.equal(assetRequests[0], "https://example.test/uz/");
assert.ok(page.headers.has(SECURITY_HEADER));
assert.ok(page.headers.has(TRANSPORT_SECURITY_HEADER));
assert.equal(page.headers.get("Cache-Control"), DOCUMENT_CACHE_POLICY);

const generatedMedia = await worker.fetch(
  new Request(
    "https://example.test/media/generated/products/can-original.webp",
  ),
  environment,
);
assert.equal(
  generatedMedia.headers.get("Cache-Control"),
  REVALIDATED_ASSET_CACHE_POLICY,
);

const font = await worker.fetch(
  new Request("https://example.test/fonts/display.woff2"),
  environment,
);
assert.equal(font.headers.get("Cache-Control"), REVALIDATED_ASSET_CACHE_POLICY);

const fingerprintedAsset = await worker.fetch(
  new Request("https://example.test/_assets/runtime.abc123.js"),
  environment,
);
assert.equal(
  fingerprintedAsset.headers.get("Cache-Control"),
  IMMUTABLE_CACHE_POLICY,
);

const missingBinding = await worker.fetch(
  new Request("https://example.test/uz/"),
  {},
);
assert.equal(missingBinding.status, 503);
assert.equal(
  missingBinding.headers.get("Cache-Control"),
  DOCUMENT_CACHE_POLICY,
);

process.stdout.write("Verified the Sites worker artifact contract.\n");
