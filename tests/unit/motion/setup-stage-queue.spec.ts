import { describe, expect, it, vi } from "vitest";

import { runSetupStageQueue } from "@/motion/setup-stage-queue";

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

  deliver(id: number, timestamp = 0): void {
    const callback = this.callbacks.get(id);
    this.callbacks.delete(id);
    callback?.(timestamp);
  }
}

type QueueOutcome =
  | Readonly<{ kind: "resolved" }>
  | Readonly<{ cause: unknown; kind: "rejected" }>;

function observeOutcome(promise: Promise<void>): Promise<QueueOutcome> {
  return promise.then(
    () => ({ kind: "resolved" }),
    (cause: unknown) => ({ cause, kind: "rejected" }),
  );
}

function startQueue(
  stages: readonly (() => void)[],
  controller: AbortController,
  raf: RafHarness,
  execute: (stage: () => void) => void = (stage): void => stage(),
): Promise<void> {
  return runSetupStageQueue({
    cancelFrame: raf.cancelFrame,
    execute,
    requestFrame: raf.requestFrame,
    signal: controller.signal,
    stages,
  });
}

describe("runSetupStageQueue", () => {
  it("GIVEN a sparse stage list WHEN the missing stage is reached THEN activation rejects instead of declaring incomplete work ready", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const stages = new Array<() => void>(1);
    const outcome = observeOutcome(startQueue(stages, controller, raf));
    raf.deliver(1);
    await expect(outcome).resolves.toEqual({
      kind: "rejected",
      cause: new TypeError("Motion setup stage is missing or invalid."),
    });
  });

  it("GIVEN frame cancellation throws WHEN abort releases the queue THEN listener cleanup still runs and readiness rejects observably", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const cleanupCause = new Error("Frame cancellation failed");
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    const outcome = observeOutcome(
      runSetupStageQueue({
        stages: [() => undefined],
        signal: controller.signal,
        requestFrame: raf.requestFrame,
        cancelFrame: () => {
          throw cleanupCause;
        },
        execute: (stage) => stage(),
      }),
    );
    controller.abort();
    const observed = await outcome;
    expect(observed.kind).toBe("rejected");
    if (observed.kind !== "rejected")
      throw new Error("Expected observable cleanup rejection.");
    expect(observed.cause).toBeInstanceOf(AggregateError);
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
  });

  it("GIVEN ordered stages WHEN frames arrive THEN exactly one stage runs per requested frame", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const order: string[] = [];
    const queue = startQueue(
      [() => order.push("first"), () => order.push("second")],
      controller,
      raf,
    );

    expect(order).toEqual([]);
    expect(raf.requestedIds).toEqual([1]);
    raf.deliver(1);
    expect(order).toEqual(["first"]);
    expect(raf.requestedIds).toEqual([1, 2]);
    raf.deliver(2);

    await expect(queue).resolves.toBeUndefined();
    expect(order).toEqual(["first", "second"]);
  });

  it("GIVEN a mutable source list WHEN it changes after scheduling THEN the finite defensive snapshot is preserved", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const order: string[] = [];
    const stages = [() => order.push("original")];
    const queue = startQueue(stages, controller, raf);

    stages[0] = () => order.push("replacement");
    stages.push(() => order.push("appended"));
    raf.deliver(1);

    await expect(queue).resolves.toBeUndefined();
    expect(order).toEqual(["original"]);
    expect(raf.requestedIds).toEqual([1]);
  });

  it.each([
    ["an empty queue", []],
    ["an already-aborted queue", [() => undefined]],
  ])(
    "GIVEN %s WHEN scheduling starts THEN it settles without requesting a frame",
    async (scenario, stages) => {
      const controller = new AbortController();
      const raf = new RafHarness();
      const execute = vi.fn<(stage: () => void) => void>();
      if (scenario === "an already-aborted queue") {
        controller.abort();
      }

      await expect(
        startQueue(stages, controller, raf, execute),
      ).resolves.toBeUndefined();
      expect(raf.requestedIds).toEqual([]);
      expect(execute).not.toHaveBeenCalled();
    },
  );

  it("GIVEN a pending frame WHEN cancellation occurs THEN it resolves and a late callback cannot execute work", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const stage = vi.fn();
    const queue = startQueue([stage], controller, raf);

    controller.abort();
    await expect(queue).resolves.toBeUndefined();
    expect(raf.canceledIds).toEqual([1]);
    raf.deliver(1);

    expect(stage).not.toHaveBeenCalled();
    expect(raf.requestedIds).toEqual([1]);
  });

  it("GIVEN requestFrame aborts synchronously WHEN it returns an id THEN that id is canceled and its late callback is inert", async () => {
    const controller = new AbortController();
    const callbacks: FrameRequestCallback[] = [];
    const cancelFrame = vi.fn<(id: number) => void>();
    const stage = vi.fn();
    const queue = runSetupStageQueue({
      cancelFrame,
      execute: (callback): void => callback(),
      requestFrame: (callback): number => {
        callbacks.push(callback);
        controller.abort();
        return 17;
      },
      signal: controller.signal,
      stages: [stage],
    });

    await expect(queue).resolves.toBeUndefined();
    expect(cancelFrame).toHaveBeenCalledExactlyOnceWith(17);
    callbacks.at(0)?.(0);
    expect(stage).not.toHaveBeenCalled();
  });

  it("GIVEN a stage aborts its own signal WHEN it executes THEN no later stage or frame is scheduled", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const laterStage = vi.fn();
    const queue = startQueue(
      [() => controller.abort(), laterStage],
      controller,
      raf,
    );

    raf.deliver(1);

    await expect(queue).resolves.toBeUndefined();
    expect(laterStage).not.toHaveBeenCalled();
    expect(raf.requestedIds).toEqual([1]);
  });

  it("GIVEN a stage aborts and then throws WHEN it unwinds THEN the thrown cause rejects instead of resolving cancellation", async () => {
    const controller = new AbortController();
    const raf = new RafHarness();
    const cause = new Error("aborted stage failed");
    const laterStage = vi.fn();
    const queue = startQueue(
      [
        () => {
          controller.abort();
          throw cause;
        },
        laterStage,
      ],
      controller,
      raf,
    );

    raf.deliver(1);

    await expect(observeOutcome(queue)).resolves.toEqual({
      cause,
      kind: "rejected",
    });
    expect(laterStage).not.toHaveBeenCalled();
    expect(raf.requestedIds).toEqual([1]);
  });

  it.each([undefined, null, 0])(
    "GIVEN a stage throws %s WHEN its frame runs THEN that exact cause rejects and later work stops",
    async (cause) => {
      const controller = new AbortController();
      const raf = new RafHarness();
      const laterStage = vi.fn();
      const queue = startQueue(
        [
          () => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error -- The queue contract preserves every thrown JavaScript value.
            throw cause;
          },
          laterStage,
        ],
        controller,
        raf,
      );

      raf.deliver(1);

      await expect(observeOutcome(queue)).resolves.toEqual({
        cause,
        kind: "rejected",
      });
      expect(laterStage).not.toHaveBeenCalled();
      expect(raf.requestedIds).toEqual([1]);
    },
  );

  it("GIVEN the first frame request throws WHEN scheduling starts THEN the cause rejects and the abort listener is removed", async () => {
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    const cause = new Error("RAF unavailable");
    const cancelFrame = vi.fn<(id: number) => void>();
    const execute = vi.fn<(stage: () => void) => void>();
    const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>(
      () => {
        throw cause;
      },
    );

    const queue = runSetupStageQueue({
      cancelFrame,
      execute,
      requestFrame,
      signal: controller.signal,
      stages: [() => undefined],
    });

    await expect(observeOutcome(queue)).resolves.toEqual({
      cause,
      kind: "rejected",
    });
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(cancelFrame).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it("GIVEN a later frame request throws WHEN a stage completes THEN the queue rejects and does not run the next stage", async () => {
    const controller = new AbortController();
    const cause = new Error("RAF stopped");
    const callbacks: FrameRequestCallback[] = [];
    const laterStage = vi.fn();
    const requestFrame = vi
      .fn<(callback: FrameRequestCallback) => number>()
      .mockImplementationOnce((callback) => {
        callbacks.push(callback);
        return 1;
      })
      .mockImplementationOnce(() => {
        throw cause;
      });
    const queue = runSetupStageQueue({
      cancelFrame: vi.fn(),
      execute: (stage): void => stage(),
      requestFrame,
      signal: controller.signal,
      stages: [() => undefined, laterStage],
    });
    const firstCallback = callbacks.at(0);

    expect(firstCallback).toBeDefined();
    firstCallback?.(0);

    await expect(observeOutcome(queue)).resolves.toEqual({
      cause,
      kind: "rejected",
    });
    expect(laterStage).not.toHaveBeenCalled();
  });
});
