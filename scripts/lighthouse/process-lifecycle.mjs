import { spawn } from "node:child_process";

export function delay(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function isTransientReadinessError(error) {
  return (
    error instanceof TypeError ||
    (error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "TimeoutError"))
  );
}

export async function endpointIsReady(url, fetchTimeoutMs) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    const isReady = response.ok;
    await response.body?.cancel();
    return isReady;
  } catch (error) {
    if (isTransientReadinessError(error)) {
      return false;
    }
    throw error;
  }
}

export async function waitForEndpoint({
  fetchTimeoutMs,
  retryIntervalMs,
  serviceName,
  timeoutMs,
  url,
}) {
  const expiresAt = Date.now() + timeoutMs;

  while (Date.now() < expiresAt) {
    if (await endpointIsReady(url, fetchTimeoutMs)) {
      return;
    }
    await delay(retryIntervalMs);
  }

  throw new Error(`${serviceName} did not become ready within ${timeoutMs}ms.`);
}

export function spawnProcess(command, argumentsList, options = {}) {
  return spawn(command, argumentsList, {
    shell: false,
    stdio: "inherit",
    ...options,
  });
}

export function runProcess(command, argumentsList, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnProcess(command, argumentsList, options);
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      code === 0
        ? resolve()
        : reject(
            new Error(
              `${command} exited with code ${String(code)} and signal ${String(signal)}.`,
            ),
          );
    });
  });
}

export function waitForProcessExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      child.removeListener("exit", handleExit);
      resolve(false);
    }, timeoutMs);
    const handleExit = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    child.once("exit", handleExit);
  });
}

export async function stopProcess({
  child,
  processTimeoutMs,
  shutdownTimeoutMs,
}) {
  if (
    child === null ||
    child.pid === undefined ||
    child.exitCode !== null ||
    child.signalCode !== null
  ) {
    return;
  }

  if (process.platform === "win32") {
    let terminationError;
    try {
      await runProcess(
        "taskkill.exe",
        ["/PID", String(child.pid), "/T", "/F"],
        { stdio: "ignore", timeout: processTimeoutMs },
      );
    } catch (error) {
      terminationError = error;
      if (child.exitCode === null) {
        child.kill();
      }
    }
    if (!(await waitForProcessExit(child, shutdownTimeoutMs))) {
      throw new Error("Managed process cleanup failed.", {
        cause: terminationError,
      });
    }
    return;
  }

  child.kill();
  if (!(await waitForProcessExit(child, shutdownTimeoutMs))) {
    throw new Error("Managed process did not exit after termination.");
  }
}

export function isTransientEndpointError(error) {
  return isTransientReadinessError(error);
}
