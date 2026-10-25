import { describe, expect, it, vi } from "vitest";

import { createOwnedScene, type SceneSetup } from "@/motion/create-scene";

import type { MotionEngine } from "@/motion/motion-engine";
import type { SceneHandle } from "@/motion/scene-contract";

class RafHarness {
  readonly canceledIds: number[] = [];
  readonly requestedIds: number[] = [];
  private readonly callbacks = new Map<number, FrameRequestCallback>();
  private nextId = 1;

  readonly requestFrame = (callback: FrameRequestCallback): number => {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.set(id, callback);
    this.requestedIds.push(id);
    return id;
  };

  readonly cancelFrame = (id: number): void => {
    this.canceledIds.push(id);
  };

  deliver(id: number): void {
    const callback = this.callbacks.get(id);
    this.callbacks.delete(id);
    callback?.(0);
  }
}

interface SceneHarness {
  readonly contextRuns: () => number;
  readonly handle: SceneHandle;
  readonly raf: RafHarness;
}

type PromiseOutcome =
  | Readonly<{ kind: "resolved" }>
  | Readonly<{ cause: unknown; kind: "rejected" }>;

function observeOutcome(promise: Promise<void>): Promise<PromiseOutcome> {
  return promise.then(
    () => ({ kind: "resolved" }),
    (cause: unknown) => ({ cause, kind: "rejected" }),
  );
}

function createEngine(
  events: string[],
  countContextRun: () => void,
): MotionEngine {
  const context = {
    add(callback: () => void): void {
      countContextRun();
      callback();
    },
    revert(): void {
      events.push("context-revert");
    },
  };
  const media = {
    revert(): void {
      events.push("media-revert");
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TYPE-EXCEPTION: This focused fake implements only the GSAP methods exercised by createOwnedScene.
  return {
    gsap: {
      context(callback: () => void) {
        callback();
        return context;
      },
      matchMedia() {
        return media;
      },
    },
    ScrollTrigger: {},
  } as unknown as MotionEngine;
}

function createRoot(raf: RafHarness): HTMLElement {
  const windowValue = {
    cancelAnimationFrame: raf.cancelFrame,
    requestAnimationFrame: raf.requestFrame,
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TYPE-EXCEPTION: The scene only needs an owning window in this DOM-free lifecycle test.
  return {
    ownerDocument: { defaultView: windowValue },
    querySelector: () => null,
    querySelectorAll: () => [],
  } as unknown as HTMLElement;
}

function createHarness(setup: SceneSetup, events: string[] = []): SceneHarness {
  const raf = new RafHarness();
  let contextRunCount = 0;
  const handle = createOwnedScene({
    capability: { kind: "full", reason: "capable-fine-pointer" },
    engine: createEngine(events, (): void => {
      contextRunCount += 1;
    }),
    id: "hero",
    root: createRoot(raf),
    setup,
  });
  return { contextRuns: () => contextRunCount, handle, raf };
}

describe("createOwnedScene staged setup", () => {
  it("GIVEN two setup stages WHEN frames arrive THEN ready stays pending and one owned stage runs per frame", async () => {
    const order: string[] = [];
    const harness = createHarness((context) => {
      context.stage(() => order.push("first"));
      context.stage(() => order.push("second"));
    });
    let readySettled = false;
    const readiness = harness.handle.ready.then((): void => {
      readySettled = true;
    });

    expect(harness.handle.getPhase()).toBe("mounting");
    expect(harness.raf.requestedIds).toEqual([1]);
    harness.raf.deliver(1);
    await Promise.resolve();
    expect(order).toEqual(["first"]);
    expect(readySettled).toBe(false);
    expect(harness.raf.requestedIds).toEqual([1, 2]);
    harness.raf.deliver(2);

    await readiness;
    expect(order).toEqual(["first", "second"]);
    expect(harness.contextRuns()).toBe(2);
    expect(harness.handle.getPhase()).toBe("active");
  });

  it("GIVEN destruction between stages WHEN a canceled callback arrives late THEN ready resolves without later work or false activation", async () => {
    const laterStage = vi.fn();
    const harness = createHarness((context) => {
      context.stage(() => undefined);
      context.stage(laterStage);
    });

    harness.raf.deliver(1);
    expect(harness.raf.requestedIds).toEqual([1, 2]);
    harness.handle.destroy();

    await expect(harness.handle.ready).resolves.toBeUndefined();
    expect(harness.handle.getPhase()).toBe("destroyed");
    expect(harness.raf.canceledIds).toContain(2);
    harness.raf.deliver(2);
    await Promise.resolve();
    expect(laterStage).not.toHaveBeenCalled();
    expect(harness.handle.getPhase()).toBe("destroyed");
  });

  it("GIVEN the second stage throws WHEN it runs in the owned context THEN rollback is reversed, listeners abort, and ready rejects", async () => {
    const cleanupOrder: string[] = [];
    const cause = new Error("second stage failed");
    const target = new EventTarget();
    const listener = vi.fn();
    const signals: AbortSignal[] = [];
    const harness = createHarness((context) => {
      signals.push(context.signal);
      context.listen(target, "probe", listener);
      context.onCleanup(() => cleanupOrder.push("first-cleanup"));
      context.onCleanup(() => cleanupOrder.push("second-cleanup"));
      context.stage(() => undefined);
      context.stage(() => {
        throw cause;
      });
    }, cleanupOrder);

    target.dispatchEvent(new Event("probe"));
    expect(listener).toHaveBeenCalledTimes(1);
    harness.raf.deliver(1);
    harness.raf.deliver(2);
    const outcome = await observeOutcome(harness.handle.ready);

    expect(outcome.kind).toBe("rejected");
    if (outcome.kind !== "rejected" || !(outcome.cause instanceof Error)) {
      throw new Error("Expected a wrapped staged-setup error.");
    }
    expect(outcome.cause.cause).toBe(cause);
    expect(cleanupOrder).toEqual([
      "second-cleanup",
      "first-cleanup",
      "media-revert",
      "context-revert",
    ]);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.aborted).toBe(true);
    expect(harness.contextRuns()).toBe(3);
    target.dispatchEvent(new Event("probe"));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(harness.handle.getPhase()).toBe("destroyed");
  });

  it("GIVEN synchronous setup has returned WHEN another stage is registered THEN registration is closed", async () => {
    let registerLate: (() => void) | null = null;
    const harness = createHarness((context) => {
      registerLate = (): void => context.stage(() => undefined);
    });

    await expect(harness.handle.ready).resolves.toBeUndefined();
    if (registerLate === null) {
      throw new Error("Late registration probe was not created.");
    }

    expect(registerLate).toThrow("Setup stage registration is closed.");
    expect(harness.raf.requestedIds).toEqual([]);
    expect(harness.handle.getPhase()).toBe("active");
  });

  it("GIVEN a mounting scene WHEN it is destroyed before the first frame THEN cancellation never marks it active", async () => {
    const stage = vi.fn();
    const harness = createHarness((context) => context.stage(stage));

    harness.handle.destroy();
    await expect(harness.handle.ready).resolves.toBeUndefined();
    harness.raf.deliver(1);
    await Promise.resolve();

    expect(stage).not.toHaveBeenCalled();
    expect(harness.handle.getPhase()).toBe("destroyed");
  });
});
