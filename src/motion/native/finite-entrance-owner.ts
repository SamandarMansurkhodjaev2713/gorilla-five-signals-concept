import { runCleanupStack } from "../cleanup-stack";

import type { Cleanup } from "../cleanup-stack";

export interface FiniteEntrancePlayer {
  play(): void;
  destroy(): void;
}

export interface FallbackAnimationContext {
  kill(revert?: boolean): void;
}

export interface FiniteEntranceLifecycle {
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}

export interface FiniteEntranceOwnerOptions {
  readonly capturePresentation: () => Cleanup;
  readonly createFallbackContext: (
    setup: () => void,
  ) => FallbackAnimationContext;
  readonly createNative: (
    lifecycle: FiniteEntranceLifecycle,
  ) => FiniteEntrancePlayer | null;
  readonly label: string;
  readonly subject: string;
  /** Infrastructure reporter must not throw from animation callbacks. */
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

type SetupOutcome = { kind: "success" } | { kind: "failure"; cause: unknown };
const NOOP: Cleanup = (): void => undefined;

/** Own a one-shot native entrance and its exact-snapshot GSAP fallback. */
export class FiniteEntranceOwner {
  private player: FiniteEntrancePlayer | null = null;
  private fallbackContext: FallbackAnimationContext | null = null;
  private restoreFallback: Cleanup | null = null;
  private closed = false;
  private started = false;

  constructor(private readonly options: FiniteEntranceOwnerOptions) {}

  start(): void {
    if (this.closed || this.started) return;
    this.started = true;
    try {
      const native = this.createNative();
      if (native === null) return this.startFallbackSafely();
      this.player = native;
      native.play();
    } catch (error: unknown) {
      this.report(error);
      this.releaseNativeSafely();
      if (!this.closed) this.startFallbackSafely();
    }
  }

  destroy(): void {
    if (this.closed) return;
    this.closed = true;
    this.releaseOwnedPresentation();
  }

  private createNative(): FiniteEntrancePlayer | null {
    return this.options.createNative({
      onComplete: (): void => this.complete(),
      onFailure: (error): void => this.handleNativeFailure(error),
    });
  }

  private handleNativeFailure(error: unknown): void {
    this.player = null;
    this.report(error);
    if (!this.closed) this.startFallbackSafely();
  }

  private startFallbackSafely(): void {
    try {
      this.installFallback();
    } catch (error: unknown) {
      this.report(error);
    }
  }

  private installFallback(): void {
    if (this.closed) return;
    const restore = this.options.capturePresentation();
    this.restoreFallback = restore;
    const result: { outcome: SetupOutcome } = { outcome: { kind: "success" } };
    const presentation = this.createFallbackContext(result, restore);
    if (result.outcome.kind === "failure")
      return this.failFallbackSetup(
        presentation,
        restore,
        result.outcome.cause,
      );
    if (this.closed) return this.releaseLateFallback(presentation, restore);
    this.fallbackContext = presentation;
  }

  private createFallbackContext(
    result: { outcome: SetupOutcome },
    restore: Cleanup,
  ): FallbackAnimationContext {
    try {
      return this.options.createFallbackContext((): void => {
        try {
          this.options.playFallback((): void => this.complete());
        } catch (cause: unknown) {
          result.outcome = { kind: "failure", cause };
        }
      });
    } catch (cause: unknown) {
      this.closed = true;
      this.restoreFallback = null;
      try {
        restore();
      } catch (cleanupError: unknown) {
        throw new AggregateError(
          [cause, cleanupError],
          `${this.options.label} fallback context and snapshot cleanup failed.`,
          { cause: cleanupError },
        );
      }
      throw cause;
    }
  }

  private failFallbackSetup(
    presentation: FallbackAnimationContext,
    restore: Cleanup,
    cause: unknown,
  ): never {
    this.closed = true;
    this.restoreFallback = null;
    try {
      this.releaseFallback(presentation, restore);
    } catch (cleanupError: unknown) {
      throw new AggregateError(
        [cause, cleanupError],
        `${this.options.label} fallback initialization and cleanup failed.`,
        { cause: cleanupError },
      );
    }
    throw cause;
  }

  private releaseLateFallback(
    presentation: FallbackAnimationContext,
    restore: Cleanup,
  ): void {
    this.restoreFallback = null;
    this.releaseFallback(presentation, restore);
  }

  private releaseFallback(
    presentation: FallbackAnimationContext,
    restore: Cleanup,
  ): void {
    runCleanupStack(
      [restore, (): void => presentation.kill(false)],
      `${this.options.label} fallback cleanup failed.`,
    );
  }

  private releaseNativeSafely(): void {
    const player = this.player;
    this.player = null;
    try {
      player?.destroy();
    } catch (error: unknown) {
      this.report(error);
    }
  }

  private releaseOwnedPresentation(): void {
    const player = this.player;
    const fallback = this.fallbackContext;
    const restore = this.restoreFallback;
    this.player = null;
    this.fallbackContext = null;
    this.restoreFallback = null;
    runCleanupStack(
      [
        restore ?? NOOP,
        (): void => fallback?.kill(false),
        (): void => player?.destroy(),
      ],
      `The ${this.options.subject} entrance failed to clean up completely.`,
    );
  }

  private complete(): void {
    if (this.closed) return;
    this.closed = true;
    try {
      this.releaseOwnedPresentation();
    } catch (error: unknown) {
      this.report(error);
    }
  }

  private report(error: unknown): void {
    this.options.onFailure(error);
  }
}
