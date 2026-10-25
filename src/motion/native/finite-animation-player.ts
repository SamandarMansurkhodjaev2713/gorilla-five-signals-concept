import { runCleanupStack } from "../cleanup-stack";
import { reusableEffectKey } from "./finite-animation-effect-key";
import { NATIVE_MOTION_EASING } from "../native-easing";

const support = new WeakMap<Window, boolean>();
const PROBE_DELAY_MS = 1;
const PROBE_DURATION_MS = 1;

export interface FiniteAnimationCue {
  readonly target: HTMLElement;
  readonly frames: readonly Keyframe[];
  readonly delayMs: number;
  readonly durationMs: number;
  readonly easing: string;
  readonly role: string;
}

interface PlayerOptions {
  readonly documentValue: Document;
  readonly cues: readonly FiniteAnimationCue[];
  readonly idPrefix: string;
  readonly label: string;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}

function probeEffectCloning(windowValue: Window & typeof globalThis): boolean {
  const source = new windowValue.KeyframeEffect(
    null,
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: PROBE_DURATION_MS, easing: NATIVE_MOTION_EASING.material },
  );
  const clone = new windowValue.KeyframeEffect(source);
  clone.target = null;
  clone.updateTiming({ delay: PROBE_DELAY_MS });
  return (
    source !== clone &&
    source.getTiming().delay === 0 &&
    clone.getTiming().delay === PROBE_DELAY_MS
  );
}

/** Verify the public Web Animations surface and the sampled linear() easing. */
export function supportsFiniteAnimationPlayer(
  windowValue: Window & typeof globalThis,
): boolean {
  const known = support.get(windowValue);
  if (known !== undefined) return known;
  let supported = false;
  if (
    typeof windowValue.KeyframeEffect === "function" &&
    typeof windowValue.Animation === "function" &&
    typeof windowValue.CSS?.supports === "function" &&
    windowValue.CSS.supports(
      "animation-timing-function",
      NATIVE_MOTION_EASING.material,
    )
  ) {
    try {
      supported = probeEffectCloning(windowValue);
    } catch (error: unknown) {
      if (!(error instanceof windowValue.TypeError)) throw error;
    }
  }
  support.set(windowValue, supported);
  return supported;
}

export class FiniteAnimationPlayer {
  private readonly animations: Animation[] = [];
  private readonly listeners = new AbortController();
  private closed = false;
  private started = false;

  constructor(private readonly options: PlayerOptions) {}

  /** Construct every idle effect before starting the shared-clock group. */
  play(): void {
    if (this.closed || this.started) return;
    this.started = true;
    try {
      this.validateTimings();
      this.constructEffects();
      this.listenForCompletion();
      this.startTogether();
    } catch (cause: unknown) {
      this.fail(cause);
    }
  }

  /** Cancel only effects allocated by this finite player. */
  destroy(): void {
    if (this.closed) return;
    this.closed = true;
    this.listeners.abort();
    const animations = this.animations.splice(0);
    runCleanupStack(
      animations.map((animation) => (): void => animation.cancel()),
      `${this.options.label} native effects failed to cancel.`,
    );
  }

  private constructEffects(): void {
    const windowValue = this.options.documentValue.defaultView;
    if (windowValue === null)
      throw new Error(`${this.options.label} requires an active document.`);
    const sources = new Map<string, KeyframeEffect>();
    this.options.cues.forEach((cue, index): void => {
      const key = reusableEffectKey(cue);
      const source = key === null ? undefined : sources.get(key);
      const effect =
        source === undefined
          ? new windowValue.KeyframeEffect(cue.target, [...cue.frames], {
              delay: cue.delayMs,
              duration: cue.durationMs,
              easing: cue.easing,
              fill: "both",
            })
          : new windowValue.KeyframeEffect(source);
      if (source !== undefined) {
        effect.target = cue.target;
        effect.updateTiming({ delay: cue.delayMs });
      } else if (key !== null) sources.set(key, effect);
      const animation = new windowValue.Animation(
        effect,
        this.options.documentValue.timeline,
      );
      animation.id = `${this.options.idPrefix}:${cue.role}:${String(index)}`;
      this.animations.push(animation);
    });
  }

  private listenForCompletion(): void {
    this.terminalAnimation().addEventListener(
      "finish",
      (): void => this.options.onComplete(),
      { signal: this.listeners.signal, once: true },
    );
  }

  private startTogether(): void {
    const origin = this.options.documentValue.timeline.currentTime;
    if (typeof origin !== "number" || !Number.isFinite(origin))
      throw new Error(
        `The ${this.options.label} document timeline is inactive.`,
      );
    for (const animation of this.animations) {
      animation.play();
      animation.startTime = origin;
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
        throw new RangeError(
          `${this.options.label} effects require finite positive timing.`,
        );
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
      throw new Error(`A ${this.options.label} native plan cannot be empty.`);
    return terminal;
  }

  private fail(cause: unknown): void {
    let failure = cause;
    try {
      this.destroy();
    } catch (cleanupError: unknown) {
      failure = new AggregateError(
        [cause, cleanupError],
        `${this.options.label} native setup and cleanup failed.`,
      );
    }
    this.options.onFailure(failure);
  }
}
