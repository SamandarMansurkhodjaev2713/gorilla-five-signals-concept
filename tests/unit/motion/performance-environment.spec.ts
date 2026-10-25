import { afterEach, describe, expect, it, vi } from "vitest";

import functionalConfig from "../../../playwright.config";
import performanceConfig from "../../../playwright.performance.config";
import { MOTION_PERFORMANCE_PROFILE } from "../../performance/support/performance-profile";
import {
  GPU_INFO_TIMEOUT_MS,
  readBrowserRenderingEnvironment,
  type BrowserRenderingSource,
} from "../../performance/support/rendering-environment";

const SYSTEM_INFO = {
  gpu: {
    featureStatus: { gpu_compositing: "enabled" },
    auxAttributes: {
      glRenderer: "ANGLE (Fixture GPU)",
      glVendor: "Fixture vendor",
    },
  },
};

function createRenderingSource(
  read: () => Promise<unknown> = () =>
    Promise.resolve(structuredClone(SYSTEM_INFO)),
  options: { detachError?: Error } = {},
) {
  const state = { detached: 0 };
  const source: BrowserRenderingSource = {
    version: () => "fixture-browser",
    newBrowserCDPSession: () =>
      Promise.resolve({
        send: () => read(),
        detach: () => {
          state.detached += 1;
          return options.detachError === undefined
            ? Promise.resolve()
            : Promise.reject(options.detachError);
        },
      }),
  };
  return { source, state };
}

afterEach(() => vi.useRealTimers());

describe("performance evidence profile", () => {
  it("GIVEN an agent-run Astro preview WHEN either browser harness starts THEN its server stays owned in the foreground without replacing the user preview lock", () => {
    for (const config of [functionalConfig, performanceConfig]) {
      const server = config.webServer;
      if (server === undefined || Array.isArray(server))
        throw new Error("Each browser harness must own one preview server.");
      expect(server.command).toContain("--ignore-lock");
    }
  });
  it("GIVEN the release profile WHEN a journey uses it THEN CPU x4 and three sessions retain the original hard limits", () => {
    expect(MOTION_PERFORMANCE_PROFILE).toEqual({
      cpuThrottleRate: 4,
      sessions: 3,
      frameWorkMs: 16,
      longTaskMs: 50,
      interactionMs: 200,
    });
    expect(Object.isFrozen(MOTION_PERFORMANCE_PROFILE)).toBe(true);
  });

  it("GIVEN valid rendering metadata WHEN inspected THEN only bounded rendering fields are returned and the session detaches", async () => {
    const { source, state } = createRenderingSource();
    expect(await readBrowserRenderingEnvironment(source)).toMatchObject({
      browserVersion: "fixture-browser",
      gpuCompositing: "enabled",
      renderer: "ANGLE (Fixture GPU)",
      vendor: "Fixture vendor",
    });
    expect(state.detached).toBe(1);
  });

  it("GIVEN missing rendering metadata WHEN inspected THEN unknown GPU state fails closed and the session detaches", async () => {
    const { source, state } = createRenderingSource(() => Promise.resolve({}));
    await expect(readBrowserRenderingEnvironment(source)).rejects.toThrow();
    expect(state.detached).toBe(1);
  });

  it("GIVEN a rejected protocol request WHEN inspected THEN the error is preserved and the session detaches", async () => {
    const failure = new Error("Fixture protocol rejection");
    const { source, state } = createRenderingSource(() =>
      Promise.reject(failure),
    );
    await expect(readBrowserRenderingEnvironment(source)).rejects.toBe(failure);
    expect(state.detached).toBe(1);
  });

  it("GIVEN an unresponsive protocol request WHEN its deadline passes THEN the request fails and the owned timer and session clear", async () => {
    vi.useFakeTimers();
    const { source, state } = createRenderingSource(
      () => new Promise<never>(() => undefined),
    );
    const assertion = expect(
      readBrowserRenderingEnvironment(source),
    ).rejects.toThrow("Browser GPU metadata request timed out.");
    await vi.advanceTimersByTimeAsync(GPU_INFO_TIMEOUT_MS);
    await assertion;
    expect(state.detached).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("GIVEN valid metadata and a cleanup failure WHEN the session detaches THEN the cleanup error is preserved", async () => {
    const cleanup = new Error("Fixture cleanup failure");
    const { source } = createRenderingSource(undefined, {
      detachError: cleanup,
    });
    await expect(readBrowserRenderingEnvironment(source)).rejects.toBe(cleanup);
  });

  it.each([new Error("Fixture read failure"), undefined])(
    "GIVEN a protocol rejection %s and cleanup failure WHEN metadata is read THEN both failures are retained",
    async (failure) => {
      const cleanup = new Error("Fixture cleanup failure");
      const read = vi.fn<() => Promise<unknown>>().mockRejectedValue(failure);
      const { source } = createRenderingSource(read, {
        detachError: cleanup,
      });
      await expect(
        readBrowserRenderingEnvironment(source),
      ).rejects.toMatchObject({
        name: "AggregateError",
        errors: [failure, cleanup],
      });
    },
  );
});
