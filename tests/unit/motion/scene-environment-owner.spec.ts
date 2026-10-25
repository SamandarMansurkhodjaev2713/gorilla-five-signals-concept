import { describe, expect, it, vi } from "vitest";

import { createSceneEnvironmentOwner } from "@/motion/runtime/scene-environment-owner";

import type { SceneRegistry } from "@/motion/scene-registry";

function createRegistry(destroy: () => void): SceneRegistry {
  return {
    destroy,
    has: () => false,
    mount: () => undefined,
    unmount: () => undefined,
  };
}

function createObserver(disconnect: () => void): IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TYPE-EXCEPTION: Ownership only exercises the observer's disconnect boundary.
  return { disconnect } as IntersectionObserver;
}

describe("createSceneEnvironmentOwner", () => {
  it("GIVEN partial environment ownership WHEN abort occurs THEN registry, observer, and deferred work release once and late ownership is rejected", () => {
    const controller = new AbortController();
    const registryDestroy = vi.fn();
    const deferred = new Map<Element, unknown>();
    const clearDeferred = vi.spyOn(deferred, "clear");
    const disconnectOwned = vi.fn();
    const disconnectLate = vi.fn();
    const owner = createSceneEnvironmentOwner({
      deferred,
      registry: createRegistry(registryDestroy),
      report: vi.fn(),
      signal: controller.signal,
    });
    owner.assignObserver(createObserver(disconnectOwned));

    controller.abort();
    owner.destroy();
    owner.assignObserver(createObserver(disconnectLate));

    expect(registryDestroy).toHaveBeenCalledTimes(1);
    expect(disconnectOwned).toHaveBeenCalledTimes(1);
    expect(clearDeferred).toHaveBeenCalledTimes(1);
    expect(disconnectLate).toHaveBeenCalledTimes(1);
  });

  it("GIVEN owned cleanup fails WHEN abort releases the environment THEN the aggregate failure is reported without a scene id", () => {
    const controller = new AbortController();
    const failure = new Error("registry cleanup failed");
    const disconnect = vi.fn();
    const report =
      vi.fn<(sceneId: string | undefined, error: unknown) => void>();
    const owner = createSceneEnvironmentOwner({
      deferred: new Map<Element, unknown>(),
      registry: createRegistry(() => {
        throw failure;
      }),
      report,
      signal: controller.signal,
    });
    owner.assignObserver(createObserver(disconnect));

    controller.abort();

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledExactlyOnceWith(
      undefined,
      expect.any(AggregateError),
    );
  });

  it("GIVEN the signal is already aborted WHEN ownership is created THEN partial resources release immediately and later observers disconnect", () => {
    const controller = new AbortController();
    const registryDestroy = vi.fn();
    const deferred = new Map<Element, unknown>();
    const clearDeferred = vi.spyOn(deferred, "clear");
    const report = vi.fn();
    const disconnectLate = vi.fn();
    controller.abort();

    const owner = createSceneEnvironmentOwner({
      deferred,
      registry: createRegistry(registryDestroy),
      report,
      signal: controller.signal,
    });
    owner.assignObserver(createObserver(disconnectLate));

    expect(registryDestroy).toHaveBeenCalledTimes(1);
    expect(clearDeferred).toHaveBeenCalledTimes(1);
    expect(disconnectLate).toHaveBeenCalledTimes(1);
    expect(report).not.toHaveBeenCalled();
  });
});
