import { captureInlineStyles } from "../inline-style-snapshot";
import { FiniteEntranceOwner } from "../native/finite-entrance-owner";
import {
  MATERIAL_PRESENTATION_PROPERTIES,
  MATERIAL_PRESENTATION_SELECTOR,
  createNativeMaterialEntrance,
} from "./material-film-native";

import type { SceneSetupContext } from "../create-scene";

interface OwnerOptions {
  readonly context: SceneSetupContext;
  readonly onFailure: (error: unknown) => void;
  readonly playFallback: (onComplete: () => void) => void;
}

/** Bind Material Film selectors and choreography to the shared entrance owner. */
export class MaterialFilmEntranceOwner {
  private readonly owner: FiniteEntranceOwner;

  constructor(options: OwnerOptions) {
    this.owner = new FiniteEntranceOwner({
      capturePresentation: () =>
        captureInlineStyles(
          options.context.queryAll<HTMLElement>(MATERIAL_PRESENTATION_SELECTOR),
          MATERIAL_PRESENTATION_PROPERTIES,
        ),
      createFallbackContext: (setup) =>
        options.context.gsap.context(setup, options.context.root),
      createNative: ({ onComplete, onFailure }) =>
        createNativeMaterialEntrance({
          root: options.context.root,
          tier: options.context.capability.kind === "full" ? "full" : "lite",
          onComplete,
          onFailure,
        }),
      label: "Material-film",
      subject: "material-film",
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
