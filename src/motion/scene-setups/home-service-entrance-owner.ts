import { captureInlineStyles } from "../inline-style-snapshot";
import { FiniteEntranceOwner } from "../native/finite-entrance-owner";
import {
  SERVICE_PRESENTATION_PROPERTIES,
  SERVICE_PRESENTATION_SELECTOR,
} from "./home-service-motion-contract";
import { createNativeHomeServiceEntrance } from "./home-service-native";

import type { SceneSetupContext } from "../create-scene";

interface OwnerOptions {
  readonly context: SceneSetupContext;
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

/** Bind HomeService selectors and choreography to the shared entrance owner. */
export class HomeServiceEntranceOwner {
  private readonly owner: FiniteEntranceOwner;

  constructor(options: OwnerOptions) {
    this.owner = new FiniteEntranceOwner({
      capturePresentation: () =>
        captureInlineStyles(
          options.context.queryAll<HTMLElement>(SERVICE_PRESENTATION_SELECTOR),
          SERVICE_PRESENTATION_PROPERTIES,
        ),
      createFallbackContext: (setup) =>
        options.context.gsap.context(setup, options.context.root),
      createNative: ({ onComplete, onFailure }) =>
        createNativeHomeServiceEntrance({
          root: options.context.root,
          tier: options.context.capability.kind === "full" ? "full" : "lite",
          onComplete,
          onFailure,
        }),
      label: "Home-service",
      subject: "home-service",
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
