import {
  FiniteAnimationPlayer,
  supportsFiniteAnimationPlayer,
} from "../native/finite-animation-player";
import { hasInlinePresentation } from "../native/presentation-guard";
import {
  homeServicePresentationTargets,
  readHomeServiceTargets,
  SERVICE_PRESENTATION_PROPERTIES,
} from "./home-service-motion-contract";
import { createHomeServicePlan } from "./home-service-native-plan";

import type { HomeServiceTier } from "./home-service-native-plan";

/** Build the public-WAAPI service entrance without style or layout reads. */
export function createNativeHomeServiceEntrance(options: {
  readonly root: HTMLElement;
  readonly tier: HomeServiceTier;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}): FiniteAnimationPlayer | null {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null || !supportsFiniteAnimationPlayer(windowValue))
    return null;
  const targets = readHomeServiceTargets(options.root);
  if (
    hasInlinePresentation(
      homeServicePresentationTargets(targets),
      SERVICE_PRESENTATION_PROPERTIES,
    )
  )
    return null;
  return new FiniteAnimationPlayer({
    documentValue: options.root.ownerDocument,
    cues: createHomeServicePlan({ targets, tier: options.tier }),
    idPrefix: "gorilla-home-service",
    label: "Home-service",
    onComplete: options.onComplete,
    onFailure: options.onFailure,
  });
}
