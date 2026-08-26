import { describe, expect, it, vi } from "vitest";

import { createOwnedScene } from "@/motion/create-scene";
import type { MotionEngine } from "@/motion/motion-engine";

interface SceneHarness {
  readonly engine: MotionEngine;
  readonly eventTarget: EventTarget;
  readonly flushFrame: () => void;
  readonly ownedCallback: ReturnType<typeof vi.fn>;
  readonly root: HTMLElement;
}

function createSceneHarness(cleanupOrder: string[]): SceneHarness {
  let pendingFrame: FrameRequestCallback | null = null;
  const eventTarget = new EventTarget();
  const ownedCallback = vi.fn((callback: () => void): void => callback());
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
  };
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
});
