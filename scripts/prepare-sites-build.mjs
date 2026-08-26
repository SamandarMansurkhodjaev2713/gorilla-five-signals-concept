import { cp, mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_DIRECTORY = path.resolve(".");
const DIST_DIRECTORY = path.join(PROJECT_DIRECTORY, "dist");
const CLIENT_DIRECTORY = path.join(DIST_DIRECTORY, "client");
const SERVER_DIRECTORY = path.join(DIST_DIRECTORY, "server");
const HOSTING_SOURCE = path.join(PROJECT_DIRECTORY, ".openai", "hosting.json");
const HOSTING_OUTPUT = path.join(DIST_DIRECTORY, ".openai", "hosting.json");
const RESERVED_ENTRIES = new Set([".openai", "client", "server"]);
const WORKER_SOURCE = `const DEFAULT_LOCALE_PATH = "/uz/";
const FAVICON_PATH = "/favicon.svg";
const LEGACY_FAVICON_PATH = "/favicon.ico";
const IMMUTABLE_ASSET_PATTERN = /^\\/_assets\\//u;
const REVALIDATED_ASSET_PATTERN = /^\\/(?:fonts|media\\/generated)\\//u;
const IMMUTABLE_CACHE_POLICY = "public, max-age=31536000, immutable";
const REVALIDATED_ASSET_CACHE_POLICY = "public, max-age=86400, stale-while-revalidate=604800";
const DOCUMENT_CACHE_POLICY = "public, max-age=0, must-revalidate";
const SECURITY_HEADERS = Object.freeze({
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
});

function cachePolicyFor(pathname) {
  if (IMMUTABLE_ASSET_PATTERN.test(pathname)) {
    return IMMUTABLE_CACHE_POLICY;
  }
  if (REVALIDATED_ASSET_PATTERN.test(pathname)) {
    return REVALIDATED_ASSET_CACHE_POLICY;
  }
  return DOCUMENT_CACHE_POLICY;
}

function withHeaders(request, response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  const pathname = new URL(request.url).pathname;
  headers.set("Cache-Control", cachePolicyFor(pathname));

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function permanentRedirect(url, pathname) {
  const destination = new URL(url);
  destination.pathname = pathname;
  return Response.redirect(destination, 308);
}

export default {
  async fetch(request, environment) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return withHeaders(request, permanentRedirect(url, DEFAULT_LOCALE_PATH));
    }
    if (url.pathname === LEGACY_FAVICON_PATH) {
      return withHeaders(request, permanentRedirect(url, FAVICON_PATH));
    }
    if (typeof environment?.ASSETS?.fetch !== "function") {
      return withHeaders(
        request,
        new Response("Static asset binding is unavailable.", {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          status: 503,
        }),
      );
    }

    const response = await environment.ASSETS.fetch(request);
    return withHeaders(request, response);
  },
};
`;

function assertGeneratedPath(target) {
  const relative = path.relative(DIST_DIRECTORY, target);
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to modify unexpected build path: ${target}`);
  }
}

function assertDirectDistChild(target) {
  assertGeneratedPath(target);
  if (path.dirname(target) !== DIST_DIRECTORY) {
    throw new Error(`Expected a direct dist child, received: ${target}`);
  }
}

const entries = await readdir(DIST_DIRECTORY, { withFileTypes: true });
const reservedEntry = entries.find((entry) => RESERVED_ENTRIES.has(entry.name));
if (reservedEntry !== undefined) {
  throw new Error(
    `Astro output collides with reserved Sites path: ${reservedEntry.name}`,
  );
}

assertGeneratedPath(CLIENT_DIRECTORY);
assertGeneratedPath(SERVER_DIRECTORY);
assertGeneratedPath(path.dirname(HOSTING_OUTPUT));
await Promise.all([
  mkdir(CLIENT_DIRECTORY, { recursive: true }),
  mkdir(SERVER_DIRECTORY, { recursive: true }),
  mkdir(path.dirname(HOSTING_OUTPUT), { recursive: true }),
]);

for (const entry of entries) {
  const source = path.join(DIST_DIRECTORY, entry.name);
  const destination = path.join(CLIENT_DIRECTORY, entry.name);
  assertDirectDistChild(source);
  assertGeneratedPath(destination);
  await rename(source, destination);
}

await Promise.all([
  cp(HOSTING_SOURCE, HOSTING_OUTPUT),
  writeFile(path.join(SERVER_DIRECTORY, "index.js"), WORKER_SOURCE, "utf8"),
]);

process.stdout.write(
  "Prepared a Cloudflare Workers-compatible Sites artifact.\n",
);
