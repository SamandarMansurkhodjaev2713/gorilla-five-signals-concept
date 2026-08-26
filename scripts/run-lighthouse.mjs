import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  delay,
  endpointIsReady,
  runProcess,
  spawnProcess,
  stopProcess,
  waitForEndpoint,
} from "./lighthouse/process-lifecycle.mjs";
import {
  createRunEvidence,
  findFailures,
  summarize,
} from "./lighthouse/report.mjs";
import {
  startWindowsChrome,
  stopWindowsChrome,
} from "./lighthouse/windows-chrome.mjs";

const HOST = "127.0.0.1";
const PORT = 4_327;
const ORIGIN = `http://${HOST}:${PORT}`;
const RUNS_PER_ROUTE = 3;
const SERVER_TIMEOUT_MS = 60_000;
const FETCH_TIMEOUT_MS = 2_000;
const PROCESS_TIMEOUT_MS = 300_000;
const RETRY_INTERVAL_MS = 250;
const FILE_CLEANUP_RETRIES = 5;
const CHROME_SHUTDOWN_TIMEOUT_MS = 5_000;
const CHROME_SETTLE_MS = 1_000;
const AUDIT_COOLDOWN_MS = 1_000;
const OUTPUT_DIRECTORY = path.resolve("test-results/lighthouse");
const AUDIT_BUILD_DIRECTORY = path.resolve("test-results/lighthouse-site");
const LIGHTHOUSE_CLI = path.resolve("node_modules/lighthouse/cli/index.js");
const ASTRO_CLI = path.resolve("node_modules/astro/bin/astro.mjs");
const LIGHTHOUSE_ASTRO_CONFIG = "astro.lighthouse.config.ts";
const PUBLIC_READINESS_ORIGIN = "https://samandarmansurkhodjaev2713.github.io";
const PUBLIC_READINESS_BASE_PATH = "/gorilla-five-signals-concept";
const DEBUG_PORT_BASE = 9_322;
const ROUTES = [
  `${PUBLIC_READINESS_BASE_PATH}/uz/`,
  `${PUBLIC_READINESS_BASE_PATH}/uz/products/original/`,
  `${PUBLIC_READINESS_BASE_PATH}/uz/find/`,
];

const recursiveRemovalOptions = {
  force: true,
  maxRetries: FILE_CLEANUP_RETRIES,
  recursive: true,
  retryDelay: RETRY_INTERVAL_MS,
};

const publicReadinessEnvironment = {
  ...process.env,
  PUBLIC_BASE_PATH: PUBLIC_READINESS_BASE_PATH,
  PUBLIC_RELEASE_MODE: "public",
  PUBLIC_SITE_ORIGIN: PUBLIC_READINESS_ORIGIN,
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function endpointBytes(url) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok || response.url !== url) {
    throw new Error(
      `Expected ${url} to return itself with a successful status; received ${response.status} from ${response.url}.`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

async function cleanupAuditResources({ chrome, debugPort, profileDirectory }) {
  const failures = [];
  try {
    await stopWindowsChrome({
      child: chrome,
      debugPort: debugPort ?? 0,
      fetchTimeoutMs: FETCH_TIMEOUT_MS,
      host: HOST,
      processTimeoutMs: PROCESS_TIMEOUT_MS,
      shutdownTimeoutMs: CHROME_SHUTDOWN_TIMEOUT_MS,
    });
  } catch (error) {
    failures.push(error);
  }
  if (process.platform === "win32") {
    try {
      await rm(profileDirectory, recursiveRemovalOptions);
    } catch (error) {
      failures.push(error);
    }
  }
  await delay(AUDIT_COOLDOWN_MS);
  if (failures.length > 0) {
    throw new AggregateError(failures, "Lighthouse audit cleanup failed.");
  }
}

async function runAudit(route, runIndex, debugPort) {
  const routeId = route.replaceAll("/", "-").replace(/^-|-$/gu, "");
  const outputPath = path.join(
    OUTPUT_DIRECTORY,
    `${routeId}-run-${String(runIndex + 1)}.json`,
  );
  const argumentsList = [
    LIGHTHOUSE_CLI,
    `${ORIGIN}${route}`,
    "--quiet",
    "--output=json",
    `--output-path=${outputPath}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  ];
  if (debugPort !== null) {
    argumentsList.push(`--port=${String(debugPort)}`);
  }

  await runProcess(process.execPath, argumentsList, {
    timeout: PROCESS_TIMEOUT_MS,
  });
  return JSON.parse(await readFile(outputPath, "utf8"));
}

async function runRoute(route, routeIndex) {
  const reports = [];
  for (let runIndex = 0; runIndex < RUNS_PER_ROUTE; runIndex += 1) {
    const auditIndex = routeIndex * RUNS_PER_ROUTE + runIndex;
    const debugPort =
      process.platform === "win32" ? DEBUG_PORT_BASE + auditIndex : null;
    if (
      debugPort !== null &&
      (await endpointIsReady(
        `http://${HOST}:${String(debugPort)}/json/version`,
        FETCH_TIMEOUT_MS,
      ))
    ) {
      throw new Error(
        `Chrome debug port ${String(debugPort)} is already serving content.`,
      );
    }
    const profileDirectory = path.join(
      OUTPUT_DIRECTORY,
      `chrome-profile-${String(process.pid)}-${String(auditIndex)}`,
    );
    const chrome = startWindowsChrome({
      debugPort: debugPort ?? 0,
      profileDirectory,
    });
    try {
      if (chrome !== null && debugPort !== null) {
        await waitForEndpoint({
          fetchTimeoutMs: FETCH_TIMEOUT_MS,
          retryIntervalMs: RETRY_INTERVAL_MS,
          serviceName: "Chrome",
          timeoutMs: SERVER_TIMEOUT_MS,
          url: `http://${HOST}:${String(debugPort)}/json/version`,
        });
        await delay(CHROME_SETTLE_MS);
      }
      reports.push(await runAudit(route, runIndex, debugPort));
    } finally {
      await cleanupAuditResources({ chrome, debugPort, profileDirectory });
    }
  }
  return reports;
}

await rm(OUTPUT_DIRECTORY, recursiveRemovalOptions);
await rm(AUDIT_BUILD_DIRECTORY, recursiveRemovalOptions);
await mkdir(OUTPUT_DIRECTORY, { recursive: true });
const previewUrl = `${ORIGIN}${PUBLIC_READINESS_BASE_PATH}/uz/`;
if (await endpointIsReady(previewUrl, FETCH_TIMEOUT_MS)) {
  throw new Error(
    `Lighthouse preview port ${String(PORT)} is already serving content. Stop the existing process before auditing the current dist artifact.`,
  );
}
let preview = null;

try {
  await runProcess(
    process.execPath,
    [ASTRO_CLI, "build", "--config", LIGHTHOUSE_ASTRO_CONFIG],
    {
      env: publicReadinessEnvironment,
      timeout: PROCESS_TIMEOUT_MS,
    },
  );
  const auditedEntry = await readFile(
    path.join(AUDIT_BUILD_DIRECTORY, "uz/index.html"),
  );
  const auditArtifact = {
    canonicalOrigin: PUBLIC_READINESS_ORIGIN,
    entrySha256: sha256(auditedEntry),
    releaseMode: "public-readiness",
  };
  preview = spawnProcess(
    process.execPath,
    [
      ASTRO_CLI,
      "preview",
      "--config",
      LIGHTHOUSE_ASTRO_CONFIG,
      "--host",
      HOST,
      "--port",
      String(PORT),
    ],
    { env: publicReadinessEnvironment, stdio: "inherit" },
  );
  await waitForEndpoint({
    fetchTimeoutMs: FETCH_TIMEOUT_MS,
    retryIntervalMs: RETRY_INTERVAL_MS,
    serviceName: "Preview",
    timeoutMs: SERVER_TIMEOUT_MS,
    url: previewUrl,
  });
  const servedEntrySha256 = sha256(await endpointBytes(previewUrl));
  if (servedEntrySha256 !== auditArtifact.entrySha256) {
    throw new Error(
      `Preview artifact mismatch: built ${auditArtifact.entrySha256}, served ${servedEntrySha256}.`,
    );
  }
  const summaries = [];
  const runs = [];

  for (const [routeIndex, route] of ROUTES.entries()) {
    const reports = await runRoute(route, routeIndex);
    runs.push(...createRunEvidence(route, reports));
    summaries.push(summarize(route, reports));
  }

  const failures = findFailures(summaries);
  await writeFile(
    path.join(OUTPUT_DIRECTORY, "summary.json"),
    `${JSON.stringify(
      { auditArtifact, failures, runs, summaries },
      undefined,
      2,
    )}\n`,
  );
  process.stdout.write(`${JSON.stringify(summaries, undefined, 2)}\n`);

  if (failures.length > 0) {
    process.stderr.write(`Lighthouse failures:\n${failures.join("\n")}\n`);
    process.exitCode = 1;
  }
} finally {
  await stopProcess({
    child: preview,
    processTimeoutMs: PROCESS_TIMEOUT_MS,
    shutdownTimeoutMs: CHROME_SHUTDOWN_TIMEOUT_MS,
  });
  await rm(AUDIT_BUILD_DIRECTORY, recursiveRemovalOptions);
}
