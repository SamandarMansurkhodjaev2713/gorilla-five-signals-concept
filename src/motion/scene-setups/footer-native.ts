import {
  FiniteAnimationPlayer,
  supportsFiniteAnimationPlayer,
} from "../native/finite-animation-player";
import { hasInlinePresentation } from "../native/presentation-guard";
import {
  FOOTER_PRESENTATION_PROPERTIES,
  footerPresentationTargets,
  readFooterEntranceTargets,
} from "./footer-motion-contract";
import { FOOTER_SIGNAL_COUNT } from "./footer-motion-spec";
import { createFooterEntrancePlan } from "./footer-native-plan";

/** Use WAAPI only for the exact footer contract; all variants retain GSAP. */
export function createNativeFooterEntrance(options: {
  readonly root: HTMLElement;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}): FiniteAnimationPlayer | null {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null || !supportsFiniteAnimationPlayer(windowValue))
    return null;
  const targets = readFooterEntranceTargets(options.root);
  if (targets.signals.length !== FOOTER_SIGNAL_COUNT || targets.copy.length > 0)
    return null;
  if (
    hasInlinePresentation(
      footerPresentationTargets(targets),
      FOOTER_PRESENTATION_PROPERTIES,
    )
  )
    return null;
  return new FiniteAnimationPlayer({
    documentValue: options.root.ownerDocument,
    cues: createFooterEntrancePlan(targets.signals),
    idPrefix: "gorilla-footer",
    label: "Footer",
    onComplete: options.onComplete,
    onFailure: options.onFailure,
  });
}
