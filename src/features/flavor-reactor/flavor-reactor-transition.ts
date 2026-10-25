import { runCleanupStack } from "@/motion/cleanup-stack";

import { animateWorld } from "./flavor-reactor-choreography";
import { captureReactorPresentation } from "./flavor-reactor-presentation";
import { createNativeReactorPlayer } from "./native/create-native-reactor";

import type { ReactorContext } from "./flavor-reactor-presentation";
import type { ReactorNativePlayer } from "./native/reactor-native-player";

type AnimationContext = ReturnType<ReactorContext["gsap"]["context"]>;
type Presentation =
  | { readonly kind: "gsap"; readonly context: AnimationContext }
  | { readonly kind: "native"; readonly player: ReactorNativePlayer };
type SetupOutcome = { kind: "success" } | { kind: "failure"; cause: unknown };

interface TransitionOptions {
  readonly context: ReactorContext;
  readonly incoming: HTMLElement;
  readonly outgoing: HTMLElement | null;
  readonly onComplete: () => void;
  /** Infrastructure reporter must not throw from an owned animation callback. */
  readonly onFailure: (error: unknown) => void;
}

/** Own only the current transition's animations and outgoing visibility lease. */
export class ReactorTransition {
  private presentation: Presentation | null = null;
  private closed = false;
  private started = false;
  private readonly previousLeaving: string | null;
  private readonly previousPreparing: string | null;
  private readonly restorePresentation: () => void;

  constructor(private readonly options: TransitionOptions) {
    this.restorePresentation = captureReactorPresentation(
      options.incoming,
      options.outgoing,
    );
    this.previousLeaving =
      options.outgoing?.getAttribute("data-reactor-leaving") ?? null;
    this.previousPreparing = options.incoming.getAttribute(
      "data-reactor-preparing",
    );
    options.outgoing?.setAttribute("data-reactor-leaving", "");
    if (options.outgoing !== null)
      options.incoming.setAttribute("data-reactor-preparing", "");
  }

  /** Start after the selection's DOM mutations have had a paint opportunity. */
  play(): void {
    if (this.closed || this.started) return;
    this.started = true;
    const result: { outcome: SetupOutcome } = { outcome: { kind: "success" } };
    try {
      this.installPresentation(result);
    } catch (cause: unknown) {
      result.outcome = { kind: "failure", cause };
    }
    if (result.outcome.kind === "failure") {
      if (this.closed) this.report(result.outcome.cause);
      else this.finish(result.outcome);
    }
  }

  private installPresentation(result: { outcome: SetupOutcome }): void {
    const native = createNativeReactorPlayer({
      ...this.options,
      onComplete: (): void => this.complete(),
      onFailure: (cause): void => this.finish({ kind: "failure", cause }),
    });
    if (native !== null) {
      this.presentation = { kind: "native", player: native };
      native.play();
      if (!this.closed) this.restorePreparing();
      return;
    }
    this.installGsapPresentation(result);
  }

  private installGsapPresentation(result: { outcome: SetupOutcome }): void {
    const presentation = this.options.context.gsap.context((): void => {
      try {
        animateWorld({
          ...this.options,
          onComplete: (): void => this.complete(),
        });
        this.restorePreparing();
      } catch (cause: unknown) {
        result.outcome = { kind: "failure", cause };
      }
    }, this.options.context.root);
    if (!this.closed) {
      this.presentation = { kind: "gsap", context: presentation };
      return;
    }
    runCleanupStack(
      [this.restorePresentation, (): void => presentation.kill(false)],
      "Late Reactor presentation cleanup failed.",
    );
  }

  /** Restore pre-transition inline styles, including on interruption and teardown. */
  destroy(): void {
    this.finish();
  }

  private restoreLease(): void {
    if (this.previousLeaving === null)
      this.options.outgoing?.removeAttribute("data-reactor-leaving");
    else
      this.options.outgoing?.setAttribute(
        "data-reactor-leaving",
        this.previousLeaving,
      );
  }

  private restorePreparing(): void {
    if (this.previousPreparing === null)
      this.options.incoming.removeAttribute("data-reactor-preparing");
    else
      this.options.incoming.setAttribute(
        "data-reactor-preparing",
        this.previousPreparing,
      );
  }

  private finish(outcome: SetupOutcome = { kind: "success" }): void {
    if (this.closed) return;
    this.closed = true;
    const presentation = this.presentation;
    this.presentation = null;
    const cleanups = [
      this.options.onComplete,
      (): void => this.restoreLease(),
      (): void => this.restorePreparing(),
      this.restorePresentation,
      // GSAP reversion may resolve computed styles during rapid input. Stop only
      // this context, then restore our exact snapshot without a style/layout read.
      (): void => {
        if (presentation?.kind === "native") presentation.player.destroy();
        else presentation?.context.kill(false);
      },
    ];
    try {
      runCleanupStack(cleanups, "Reactor transition cleanup failed.");
    } catch (cleanupError: unknown) {
      const error =
        outcome.kind === "success"
          ? cleanupError
          : new AggregateError(
              [outcome.cause, cleanupError],
              "Reactor initialization and cleanup failed.",
            );
      this.report(error);
      return;
    }
    if (outcome.kind === "failure") this.report(outcome.cause);
  }

  private report(error: unknown): void {
    this.options.onFailure(error);
  }

  private complete(): void {
    if (this.closed) return;
    this.finish();
  }
}
