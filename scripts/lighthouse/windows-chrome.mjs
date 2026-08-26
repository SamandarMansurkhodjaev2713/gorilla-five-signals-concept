import { existsSync } from "node:fs";

import {
  isTransientEndpointError,
  spawnProcess,
  stopProcess,
  waitForProcessExit,
} from "./process-lifecycle.mjs";

const WINDOWS_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

export function startWindowsChrome({ debugPort, profileDirectory }) {
  if (process.platform !== "win32") {
    return null;
  }

  const executable = WINDOWS_CHROME_PATHS.find((candidate) =>
    existsSync(candidate),
  );
  if (!executable) {
    throw new Error("A supported Chrome installation was not found.");
  }

  return spawnProcess(
    executable,
    [
      `--remote-debugging-port=${String(debugPort)}`,
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--user-data-dir=${profileDirectory}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
}

async function requestBrowserShutdown({
  debugPort,
  fetchTimeoutMs,
  host,
  shutdownTimeoutMs,
}) {
  try {
    const response = await fetch(
      `http://${host}:${String(debugPort)}/json/version`,
      { signal: AbortSignal.timeout(fetchTimeoutMs) },
    );
    if (!response.ok) {
      await response.body?.cancel();
      return;
    }
    const payload = await response.json();
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("webSocketDebuggerUrl" in payload) ||
      typeof payload.webSocketDebuggerUrl !== "string"
    ) {
      return;
    }

    await new Promise((resolve) => {
      const socket = new WebSocket(payload.webSocketDebuggerUrl);
      let finished = false;
      let timeoutId;
      const finish = () => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timeoutId);
        resolve();
      };
      timeoutId = setTimeout(() => {
        socket.close();
        finish();
      }, shutdownTimeoutMs);

      socket.addEventListener(
        "open",
        () => {
          socket.send(JSON.stringify({ id: 1, method: "Browser.close" }));
        },
        { once: true },
      );
      socket.addEventListener("message", finish, { once: true });
      socket.addEventListener("close", finish, { once: true });
      socket.addEventListener("error", finish, { once: true });
    });
  } catch (error) {
    if (!isTransientEndpointError(error)) {
      throw error;
    }
  }
}

export async function stopWindowsChrome({
  child,
  debugPort,
  fetchTimeoutMs,
  host,
  processTimeoutMs,
  shutdownTimeoutMs,
}) {
  if (child === null) {
    return;
  }

  await requestBrowserShutdown({
    debugPort,
    fetchTimeoutMs,
    host,
    shutdownTimeoutMs,
  });
  if (await waitForProcessExit(child, shutdownTimeoutMs)) {
    return;
  }
  await stopProcess({ child, processTimeoutMs, shutdownTimeoutMs });
}
