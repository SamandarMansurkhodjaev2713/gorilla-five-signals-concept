import { describe, expect, it, vi } from "vitest";

import { createOwnedScene } from "@/motion/create-scene";
import type { MotionEngine } from "@/motion/motion-engine";

interface SceneHarness {
  readonly engine: MotionEngine;
  readonly eventTarget: EventTarget;
  readonly flushFrame: () => void;
  readonly ownedCallback: ReturnType<typeof vi.fn>;
  readonly contextReturned: ReturnType<typeof vi.fn>;
  readonly root: HTMLElement;
}

function createSceneHarness(cleanupOrder: string[]): SceneHarness {
  let pendingFrame: FrameRequestCallback | null = null;
  const eventTarget = new EventTarget();
  const ownedCallback = vi.fn((callback: () => void): void => callback());
  const contextReturned = vi.fn();
  const context = {
    add: ownedCallback,
    revert: (): void => {
      cleanupOrder.push("context");
    },
  };
  const windowValue = {
    cancelAnimationFrame: vi.fn(),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback): number => {
      pendingFrame = callback;
      return 1;
    }),
  };
  const rootValue = Object.assign(new EventTarget(), {
    ownerDocument: { defaultView: windowValue },
    querySelector: (): Element | null => null,
    querySelectorAll: (): readonly Element[] => [],
  });
  const engineValue = {
    ScrollTrigger: {},
    gsap: {
      context: (callback: () => void): typeof context => {
        callback();
        contextReturned();
        return context;
      },
      matchMedia: (): { revert(): void } => ({
        revert: (): void => {
          cleanupOrder.push("media");
        },
      }),
      timeline: vi.fn(),
    },
  };

  return {
    // TYPE-EXCEPTION: The unit harness intentionally implements only the DOM
    // surface consumed by createOwnedScene; browser behavior is covered in E2E.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    root: rootValue as unknown as HTMLElement,
    // TYPE-EXCEPTION: The unit harness intentionally implements only the GSAP
    // surface consumed by this ownership test.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    engine: engineValue as unknown as MotionEngine,
    eventTarget,
    flushFrame: (): void => {
      const callback = pendingFrame;
      pendingFrame = null;
      callback?.(16);
    },
    ownedCallback,
    contextReturned,
  };
}

function captureFailure(callback: () => void): unknown {
  try {
    callback();
  } catch (error: unknown) {
    return error;
  }
  throw new Error("Expected the scene operation to fail.");
}

describe("createOwnedScene", () => {
  it("GIVEN event and frame animations WHEN they run THEN both are registered in the scene context and context reverts last", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const animate = vi.fn();
    const scene = createOwnedScene({
      capability: { kind: "full", reason: "user-enabled" },
      engine: harness.engine,
      id: "product-compare",
      root: harness.root,
      setup: (context): void => {
        context.listen(harness.eventTarget, "animate", animate);
        context.requestFrame(animate);
        context.onCleanup((): void => {
          cleanupOrder.push("feature");
        });
      },
    });

    harness.eventTarget.dispatchEvent(new Event("animate"));
    harness.flushFrame();
    scene.destroy();

    expect(animate).toHaveBeenCalledTimes(2);
    expect(harness.ownedCallback).toHaveBeenCalledTimes(2);
    expect(cleanupOrder).toEqual(["feature", "media", "context"]);
  });

  it("GIVEN a pending frame WHEN the scene is destroyed THEN the frame is cancelled and cannot create late motion", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const animate = vi.fn();
    const scene = createOwnedScene({
      capability: { kind: "lite", reason: "user-selected" },
      engine: harness.engine,
      id: "product-compare",
      root: harness.root,
      setup: (context): void => {
        context.requestFrame(animate);
      },
    });

    scene.destroy();
    harness.flushFrame();

    expect(animate).not.toHaveBeenCalled();
    expect(harness.ownedCallback).not.toHaveBeenCalled();
  });

  it("GIVEN failed setup WHEN rollback runs THEN listeners abort, frames stop and owned resources release", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const setupError = new Error("setup rejected");
    const animate = vi.fn();
    const signals: AbortSignal[] = [];
    const error = captureFailure((): void => {
      createOwnedScene({
        capability: { kind: "full", reason: "user-enabled" },
        engine: harness.engine,
        id: "product-compare",
        root: harness.root,
        setup: (context): void => {
          signals.push(context.signal);
          context.listen(harness.eventTarget, "animate", animate);
          context.requestFrame(animate);
          context.onCleanup((): void => {
            cleanupOrder.push("feature");
          });
          throw setupError;
        },
      });
    });
    harness.eventTarget.dispatchEvent(new Event("animate"));
    harness.flushFrame();
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      message: 'Scene "product-compare" failed during setup: setup rejected',
      cause: setupError,
    });
    expect(signals[0]?.aborted).toBe(true);
    expect(animate).not.toHaveBeenCalled();
    expect(harness.contextReturned).toHaveBeenCalledTimes(1);
    expect(cleanupOrder).toEqual(["feature", "media", "context"]);
  });

  it("GIVEN failed setup and failed cleanup WHEN rollback runs THEN both errors survive and remaining resources release", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const setupError = new Error("setup rejected");
    const cleanupError = new Error("cleanup rejected");
    const error = captureFailure((): void => {
      createOwnedScene({
        capability: { kind: "full", reason: "user-enabled" },
        engine: harness.engine,
        id: "product-compare",
        root: harness.root,
        setup: (context): void => {
          context.onCleanup((): void => {
            cleanupOrder.push("first");
          });
          context.onCleanup((): void => {
            cleanupOrder.push("throwing");
            throw cleanupError;
          });
          throw setupError;
        },
      });
    });
    expect(error).toBeInstanceOf(AggregateError);
    if (!(error instanceof AggregateError))
      throw new Error("Expected aggregate rollback error.");
    expect(error.message).toBe(
      'Scene "product-compare" failed during setup and cleanup.',
    );
    expect(error.errors[0]).toBe(setupError);
    expect(error.cause).toBe(error.errors[1]);
    expect(error.errors[1]).toMatchObject({
      message: "One or more emergency scene resources failed to clean up.",
      errors: [cleanupError],
    });
    expect(cleanupOrder).toEqual(["throwing", "first", "media", "context"]);
  });

  it.each([undefined, null, 0])(
    "GIVEN setup throws %s WHEN rollback runs THEN falsy causes are preserved and the assigned context reverts",
    (cause: unknown) => {
      const cleanupOrder: string[] = [];
      const harness = createSceneHarness(cleanupOrder);
      const error = captureFailure(() =>
        createOwnedScene({
          capability: { kind: "full", reason: "user-enabled" },
          engine: harness.engine,
          id: "hero",
          root: harness.root,
          setup: (): never => {
            throw cause;
          },
        }),
      );
      expect(error).toMatchObject({ cause });
      expect(harness.contextReturned).toHaveBeenCalledTimes(1);
      expect(cleanupOrder).toEqual(["media", "context"]);
    },
  );

  it("GIVEN a throwing cleanup WHEN destroyed THEN all other resources release and repeated destroy stays inert", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const cleanupError = new Error("cleanup rejected");
    const signals: AbortSignal[] = [];
    const scene = createOwnedScene({
      capability: { kind: "full", reason: "user-enabled" },
      engine: harness.engine,
      id: "product-compare",
      root: harness.root,
      setup: (context): void => {
        signals.push(context.signal);
        context.onCleanup((): void => {
          cleanupOrder.push("first");
        });
        context.onCleanup((): void => {
          cleanupOrder.push("throwing");
          throw cleanupError;
        });
      },
    });
    const error = captureFailure((): void => scene.destroy());
    expect(error).toBeInstanceOf(AggregateError);
    expect(error).toMatchObject({
      message: "One or more owned scene resources failed to clean up.",
      errors: [cleanupError],
    });
    expect(signals[0]?.aborted).toBe(true);
    expect(scene.getPhase()).toBe("destroyed");
    expect(cleanupOrder).toEqual(["throwing", "first", "media", "context"]);
    expect((): void => scene.destroy()).not.toThrow();
    expect(cleanupOrder).toEqual(["throwing", "first", "media", "context"]);
  });

  it("GIVEN successful setup with a returned cleanup WHEN destroyed twice THEN each owned resource releases once", () => {
    const cleanupOrder: string[] = [];
    const harness = createSceneHarness(cleanupOrder);
    const scene = createOwnedScene({
      capability: { kind: "lite", reason: "touch" },
      engine: harness.engine,
      id: "product-compare",
      root: harness.root,
      setup: (context): (() => void) => {
        context.ownObserver({
          disconnect: (): void => {
            cleanupOrder.push("observer");
          },
        });
        return (): void => {
          cleanupOrder.push("returned");
        };
      },
    });
    expect(scene.getPhase()).toBe("active");
    scene.destroy();
    scene.destroy();
    expect(scene.getPhase()).toBe("destroyed");
    expect(cleanupOrder).toEqual(["returned", "observer", "media", "context"]);
  });
});
