import { captureInlineStyles } from "../inline-style-snapshot";
import { FiniteEntranceOwner } from "../native/finite-entrance-owner";
import {
  FOOTER_PRESENTATION_PROPERTIES,
  FOOTER_PRESENTATION_SELECTOR,
} from "./footer-motion-contract";
import { createNativeFooterEntrance } from "./footer-native";

import type { SceneSetupContext } from "../create-scene";

interface OwnerOptions {
  readonly context: SceneSetupContext;
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

/** Bind footer targets and fallback presentation to the shared owner. */
export class FooterEntranceOwner {
  private readonly owner: FiniteEntranceOwner;

  constructor(options: OwnerOptions) {
    this.owner = new FiniteEntranceOwner({
      capturePresentation: () =>
        captureInlineStyles(
          options.context.queryAll<HTMLElement>(FOOTER_PRESENTATION_SELECTOR),
          FOOTER_PRESENTATION_PROPERTIES,
        ),
      createFallbackContext: (setup) =>
        options.context.gsap.context(setup, options.context.root),
      createNative: ({ onComplete, onFailure }) =>
        createNativeFooterEntrance({
          root: options.context.root,
          onComplete,
          onFailure,
        }),
      label: "Footer",
      subject: "footer",
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
