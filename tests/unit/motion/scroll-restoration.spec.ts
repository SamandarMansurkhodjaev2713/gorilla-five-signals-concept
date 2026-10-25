import { describe, expect, it } from "vitest";

import { createScrollRestoration } from "@/motion/scroll-restoration";

const MAXIMUM_FRAMES = 12;
const STABLE_FRAMES = 2;
const TOLERANCE_PX = 12;
const TEST_FLUSH_LIMIT = MAXIMUM_FRAMES * 2;

function createHarness(initialY: number, clampAt?: number) {
  let currentY = initialY;
  let sequence = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const writes: number[] = [];
  const port = {
    currentY: () => currentY,
    writeY: (position: number): void => {
      writes.push(position);
      currentY = clampAt === undefined ? position : Math.min(clampAt, position);
    },
    requestFrame: (callback: FrameRequestCallback): number => {
      const handle = ++sequence;
      pending.set(handle, callback);
      return handle;
    },
    cancelFrame: (handle: number): void => {
      pending.delete(handle);
    },
  };
  const nextFrame = (): FrameRequestCallback => {
    const next = pending.entries().next();
    if (next.done)
      throw new Error("The test requires an actually scheduled frame.");
    const [handle, callback] = next.value;
    pending.delete(handle);
    return callback;
  };
  const flush = (): void => {
    for (
      let index = 0;
      index < TEST_FLUSH_LIMIT && pending.size > 0;
      index += 1
    )
      nextFrame()(0);
    expect(pending.size).toBe(0);
  };
  return { port, pending, writes, nextFrame, flush, requested: () => sequence };
}

function createRestoration(harness: ReturnType<typeof createHarness>) {
  return createScrollRestoration({
    port: harness.port,
    maximumFrames: MAXIMUM_FRAMES,
    stableFrames: STABLE_FRAMES,
    tolerancePx: TOLERANCE_PX,
  });
}

describe("bounded scroll restoration ownership", () => {
  it("GIVEN a shifted reload WHEN its target stabilizes THEN correction stops before consuming the entire frame limit", () => {
    const harness = createHarness(668);
    createRestoration(harness).restore(600);
    harness.flush();
    expect(harness.writes).toEqual([600]);
    expect(harness.requested()).toBe(1 + STABLE_FRAMES);
  });

  it("GIVEN an already correct coordinate WHEN restored THEN stable frames do not perform writes", () => {
    const harness = createHarness(600);
    createRestoration(harness).restore(600);
    harness.flush();
    expect(harness.writes).toEqual([]);
    expect(harness.requested()).toBe(STABLE_FRAMES);
  });

  it("GIVEN an unreachable target WHEN the page clamps scrolling THEN the original hard frame limit terminates restoration", () => {
    const harness = createHarness(0, 100);
    createRestoration(harness).restore(600);
    harness.flush();
    expect(harness.writes).toHaveLength(MAXIMUM_FRAMES);
    expect(harness.requested()).toBe(MAXIMUM_FRAMES);
  });

  it("GIVEN a pending restoration WHEN new intent cancels it THEN even a late frame cannot move the page", () => {
    const harness = createHarness(0);
    const restoration = createRestoration(harness);
    restoration.restore(600);
    const lateFrame = harness.nextFrame();
    restoration.cancel();
    lateFrame(0);
    expect(harness.writes).toEqual([]);
    expect(harness.pending.size).toBe(0);
  });

  it("GIVEN overlapping requests WHEN a new destination wins THEN stale frames cannot restore the old position", () => {
    const harness = createHarness(0);
    const restoration = createRestoration(harness);
    restoration.restore(600);
    const staleFrame = harness.nextFrame();
    restoration.restore(900);
    staleFrame(0);
    harness.flush();
    expect(harness.writes).toEqual([900]);
  });

  it.each([-1, NaN, Infinity])(
    "GIVEN invalid target %s WHEN requested THEN no frame is scheduled",
    (target) => {
      const harness = createHarness(0);
      expect(() => createRestoration(harness).restore(target)).toThrow(
        RangeError,
      );
      expect(harness.pending.size).toBe(0);
    },
  );

  it.each([
    { maximumFrames: 0, stableFrames: 2, tolerancePx: 12 },
    { maximumFrames: 1.5, stableFrames: 1, tolerancePx: 12 },
    { maximumFrames: 12, stableFrames: 0, tolerancePx: 12 },
    { maximumFrames: 12, stableFrames: 1.5, tolerancePx: 12 },
    { maximumFrames: 1, stableFrames: 2, tolerancePx: 12 },
    { maximumFrames: 12, stableFrames: 2, tolerancePx: -1 },
    { maximumFrames: 12, stableFrames: 2, tolerancePx: Infinity },
  ])(
    "GIVEN invalid frame policy %j WHEN created THEN restoration fails closed",
    (policy) => {
      expect(() =>
        createScrollRestoration({ ...policy, port: createHarness(0).port }),
      ).toThrow(RangeError);
    },
  );
});
