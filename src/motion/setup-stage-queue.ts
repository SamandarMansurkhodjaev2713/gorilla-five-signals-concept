export type SetupStage = () => void;

export interface SetupStageQueueOptions {
  readonly stages: readonly SetupStage[];
  readonly signal: AbortSignal;
  readonly requestFrame: (callback: FrameRequestCallback) => number;
  readonly cancelFrame: (id: number) => void;
  readonly execute: (stage: SetupStage) => void;
}

type QueueOutcome = { kind: "complete" } | { kind: "failure"; cause: unknown };

class SetupStageQueue {
  private readonly stages: readonly SetupStage[];
  private frameId: number | null = null;
  private settled = false;
  private executing = false;
  private index = 0;

  constructor(
    private readonly options: SetupStageQueueOptions,
    private readonly resolve: () => void,
    private readonly reject: (cause: unknown) => void,
  ) {
    this.stages = [...options.stages];
  }

  start(): void {
    this.options.signal.addEventListener("abort", this.cancel, { once: true });
    if (this.options.signal.aborted || this.stages.length === 0) {
      this.cancel();
      return;
    }
    this.schedule();
  }

  private readonly cancel = (): void => {
    if (this.executing) return;
    this.finish({ kind: "complete" });
  };

  private finish(outcome: QueueOutcome): void {
    if (this.settled) return;
    this.settled = true;
    const frameId = this.frameId;
    this.frameId = null;
    try {
      runCleanupStack(
        [
          () => this.options.signal.removeEventListener("abort", this.cancel),
          () => {
            if (frameId !== null) this.options.cancelFrame(frameId);
          },
        ],
        "Setup stage queue cleanup failed.",
      );
    } catch (cleanupCause: unknown) {
      const causes =
        outcome.kind === "failure"
          ? [outcome.cause, cleanupCause]
          : [cleanupCause];
      this.reject(
        new AggregateError(causes, "Setup stage queue failed during cleanup.", {
          cause: cleanupCause,
        }),
      );
      return;
    }
    if (outcome.kind === "failure") this.reject(outcome.cause);
    else this.resolve();
  }

  private schedule(): void {
    try {
      const id = this.options.requestFrame(this.advance);
      if (this.settled || this.options.signal.aborted) {
        this.options.cancelFrame(id);
        this.cancel();
      } else this.frameId = id;
    } catch (cause: unknown) {
      this.finish({ kind: "failure", cause });
    }
  }

  private readonly advance = (): void => {
    this.frameId = null;
    if (this.settled || this.options.signal.aborted) return this.cancel();
    const stage = this.stages[this.index];
    if (typeof stage !== "function") {
      this.finish({
        kind: "failure",
        cause: new TypeError("Motion setup stage is missing or invalid."),
      });
      return;
    }
    try {
      this.executing = true;
      this.options.execute(stage);
      this.executing = false;
      this.index += 1;
      if (this.options.signal.aborted || this.index === this.stages.length) {
        this.cancel();
        return;
      }
      this.schedule();
    } catch (cause: unknown) {
      this.executing = false;
      this.finish({ kind: "failure", cause });
    }
  };
}

/** One finite setup stage per frame; cancellation settles without executing late work. */
export function runSetupStageQueue(
  options: SetupStageQueueOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    new SetupStageQueue(options, resolve, reject).start();
  });
}
import { runCleanupStack } from "./cleanup-stack";
