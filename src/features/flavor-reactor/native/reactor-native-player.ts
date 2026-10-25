import { runCleanupStack } from "@/motion/cleanup-stack";
import { REACTOR_NATIVE_EASING } from "./reactor-easing";

import type { ReactorNativeCue } from "./reactor-native-types";

export class ReactorNativePlayer {
  private readonly animations: Animation[] = [];
  private readonly listeners = new AbortController();
  private closed = false;
  private started = false;

  constructor(
    private readonly options: {
      readonly documentValue: Document;
      readonly cues: readonly ReactorNativeCue[];
      readonly onComplete: () => void;
      readonly onFailure: (error: unknown) => void;
    },
  ) {}

  /** Construct every idle effect before starting the complete shared-clock group. */
  play(): void {
    if (this.closed || this.started) return;
    this.started = true;
    try {
      this.validateTimings();
      this.constructEffects();
      const last = this.terminalAnimation();
      last.addEventListener("finish", (): void => this.options.onComplete(), {
        signal: this.listeners.signal,
        once: true,
      });
      const origin = this.options.documentValue.timeline.currentTime;
      if (typeof origin !== "number" || !Number.isFinite(origin))
        throw new Error("The Reactor document timeline is inactive.");
      for (const animation of this.animations) {
        animation.play();
        animation.startTime = origin;
      }
    } catch (cause: unknown) {
      this.fail(cause);
    }
  }

  /** Cancel only effects owned by this transition; never commit presentation to CSS. */
  destroy(): void {
    if (this.closed) return;
    this.closed = true;
    this.listeners.abort();
    const animations = this.animations.splice(0);
    runCleanupStack(
      animations.map((animation) => (): void => animation.cancel()),
      "Reactor native effects failed to cancel.",
    );
  }

  private constructEffects(): void {
    const windowValue = this.options.documentValue.defaultView;
    if (windowValue === null)
      throw new Error("Reactor requires an active document.");
    for (const cue of this.options.cues) {
      const effect = new windowValue.KeyframeEffect(
        cue.target,
        [...cue.frames],
        {
          delay: cue.delayMs,
          duration: cue.durationMs,
          easing: REACTOR_NATIVE_EASING[cue.ease],
          fill: "both",
        },
      );
      const animation = new windowValue.Animation(
        effect,
        this.options.documentValue.timeline,
      );
      animation.id = `gorilla-reactor:${cue.role}:${this.animations.length}`;
      this.animations.push(animation);
    }
  }

  private validateTimings(): void {
    for (const cue of this.options.cues) {
      const end = cue.delayMs + cue.durationMs;
      if (
        !Number.isFinite(end) ||
        !Number.isFinite(cue.delayMs) ||
        !Number.isFinite(cue.durationMs) ||
        cue.delayMs < 0 ||
        cue.durationMs <= 0
      )
        throw new RangeError("Reactor effects require finite positive timing.");
    }
  }

  private terminalAnimation(): Animation {
    let index = -1;
    let maximum = -Infinity;
    this.options.cues.forEach((cue, cueIndex): void => {
      const end = cue.delayMs + cue.durationMs;
      if (end > maximum) {
        maximum = end;
        index = cueIndex;
      }
    });
    const terminal = this.animations[index];
    if (terminal === undefined)
      throw new Error("A Reactor native plan cannot be empty.");
    return terminal;
  }

  private fail(cause: unknown): void {
    let failure = cause;
    try {
      this.destroy();
    } catch (cleanupError: unknown) {
      failure = new AggregateError(
        [cause, cleanupError],
        "Reactor native setup and cleanup failed.",
      );
    }
    this.options.onFailure(failure);
  }
}
