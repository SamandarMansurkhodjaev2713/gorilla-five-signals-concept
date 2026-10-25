import { captureInlineStyles } from "../inline-style-snapshot";
import { FiniteEntranceOwner } from "../native/finite-entrance-owner";
import {
  TERMINAL_PRESENTATION_PROPERTIES,
  TERMINAL_PRESENTATION_SELECTOR,
} from "./home-terminal-motion-contract";
import { createNativeTerminalEntrance } from "./home-terminal-native";

import type { SceneSetupContext } from "../create-scene";

interface OwnerOptions {
  readonly context: SceneSetupContext;
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

/** Bind Terminal selectors and choreography to the shared entrance owner. */
export class HomeTerminalEntranceOwner {
  private readonly owner: FiniteEntranceOwner;

  constructor(options: OwnerOptions) {
    this.owner = new FiniteEntranceOwner({
      capturePresentation: () =>
        captureInlineStyles(
          options.context.queryAll<HTMLElement>(TERMINAL_PRESENTATION_SELECTOR),
          TERMINAL_PRESENTATION_PROPERTIES,
        ),
      createFallbackContext: (setup) =>
        options.context.gsap.context(setup, options.context.root),
      createNative: ({ onComplete, onFailure }) =>
        createNativeTerminalEntrance({
          root: options.context.root,
          tier: options.context.capability.kind === "full" ? "full" : "lite",
          onComplete,
          onFailure,
        }),
      label: "Terminal",
      subject: "terminal",
      onFailure: options.onFailure,
      playFallback: options.playFallback,
    });
  }

  start(): void {
    this.owner.start();
  }

  destroy(): void {
    this.owner.destroy();
  }
}
