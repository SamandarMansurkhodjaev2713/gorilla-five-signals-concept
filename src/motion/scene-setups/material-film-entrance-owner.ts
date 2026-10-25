import { runCleanupStack } from "../cleanup-stack";
import { captureInlineStyles } from "../inline-style-snapshot";
import {
  MATERIAL_PRESENTATION_PROPERTIES,
  MATERIAL_PRESENTATION_SELECTOR,
  createNativeMaterialEntrance,
} from "./material-film-native";

import type { Cleanup } from "../cleanup-stack";
import type { SceneSetupContext } from "../create-scene";
import type { FiniteAnimationPlayer } from "../native/finite-animation-player";

type AnimationContext = ReturnType<SceneSetupContext["gsap"]["context"]>;
type SetupOutcome = { kind: "success" } | { kind: "failure"; cause: unknown };

interface OwnerOptions {
  readonly context: SceneSetupContext;
  /** Infrastructure reporter must not throw from animation callbacks. */
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

const NOOP: Cleanup = (): void => undefined;

function capturePresentation(context: SceneSetupContext): Cleanup {
  const targets = context.queryAll<HTMLElement>(MATERIAL_PRESENTATION_SELECTOR);
  return captureInlineStyles(targets, MATERIAL_PRESENTATION_PROPERTIES);
}

/** Own the one-shot native path and its isolated GSAP fallback transaction. */
export class MaterialFilmEntranceOwner {
  private player: FiniteAnimationPlayer | null = null;
  private fallbackContext: AnimationContext | null = null;
  private restoreFallback: Cleanup | null = null;
  private closed = false;
  private started = false;

  constructor(private readonly options: OwnerOptions) {}

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

  private createNative(): FiniteAnimationPlayer | null {
    return createNativeMaterialEntrance({
      root: this.options.context.root,
      tier: this.motionTier(),
      onComplete: (): void => this.complete(),
      onFailure: (error): void => this.handleNativeFailure(error),
    });
  }

  private motionTier(): "full" | "lite" {
    return this.options.context.capability.kind === "full" ? "full" : "lite";
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
    const restore = capturePresentation(this.options.context);
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
  ): AnimationContext {
    try {
      return this.options.context.gsap.context((): void => {
        try {
          this.options.playFallback((): void => this.complete());
        } catch (cause: unknown) {
          result.outcome = { kind: "failure", cause };
        }
      }, this.options.context.root);
    } catch (cause: unknown) {
      this.closed = true;
      this.restoreFallback = null;
      try {
        restore();
      } catch (cleanupError: unknown) {
        throw new AggregateError(
          [cause, cleanupError],
          "Material-film fallback context and snapshot cleanup failed.",
          { cause: cleanupError },
        );
      }
      throw cause;
    }
  }

  private failFallbackSetup(
    presentation: AnimationContext,
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
        "Material-film fallback initialization and cleanup failed.",
        { cause: cleanupError },
      );
    }
    throw cause;
  }

  private releaseLateFallback(
    presentation: AnimationContext,
    restore: Cleanup,
  ): void {
    this.restoreFallback = null;
    this.releaseFallback(presentation, restore);
  }

  private releaseFallback(
    presentation: AnimationContext,
    restore: Cleanup,
  ): void {
    runCleanupStack(
      [restore, (): void => presentation.kill(false)],
      "Material-film fallback cleanup failed.",
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
      "The material-film entrance failed to clean up completely.",
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
