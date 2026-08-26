const MOTION_IDLE_TIMEOUT_MS = 1_200;

export function waitForCriticalRender(
  documentValue: Document,
  windowValue: Window,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    let idleCallbackId: number | null = null;
    let timeoutId: number | null = null;
    let finished = false;

    const cleanup = (): void => {
      windowValue.removeEventListener("load", scheduleIdle);
      signal.removeEventListener("abort", finish);
      if (idleCallbackId !== null) {
        windowValue.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        windowValue.clearTimeout(timeoutId);
      }
    };
    const finish = (): void => {
      if (finished) {
        return;
      }
      finished = true;
      cleanup();
      resolve();
    };
    const scheduleIdle = (): void => {
      if (signal.aborted) {
        finish();
        return;
      }
      if (typeof windowValue.requestIdleCallback === "function") {
        idleCallbackId = windowValue.requestIdleCallback(finish, {
          timeout: MOTION_IDLE_TIMEOUT_MS,
        });
        return;
      }
      timeoutId = windowValue.setTimeout(finish, 0);
    };

    signal.addEventListener("abort", finish, { once: true });
    if (documentValue.readyState === "complete") {
      scheduleIdle();
      return;
    }
    windowValue.addEventListener("load", scheduleIdle, { once: true });
  });
}
