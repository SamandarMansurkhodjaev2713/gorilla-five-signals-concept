import {
  FiniteAnimationPlayer,
  supportsFiniteAnimationPlayer,
} from "../native/finite-animation-player";
import { hasInlinePresentation } from "../native/presentation-guard";
import {
  TERMINAL_PRESENTATION_PROPERTIES,
  readTerminalEntranceTargets,
  terminalPresentationTargets,
} from "./home-terminal-motion-contract";
import { createTerminalEntrancePlan } from "./home-terminal-native-plan";

import type { TerminalEntranceTier } from "./home-terminal-native-plan";

/** Build the public-WAAPI terminal entrance without layout/style resolution. */
export function createNativeTerminalEntrance(options: {
  readonly root: HTMLElement;
  readonly tier: TerminalEntranceTier;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}): FiniteAnimationPlayer | null {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null || !supportsFiniteAnimationPlayer(windowValue))
    return null;
  const targets = readTerminalEntranceTargets(options.root);
  if (
    hasInlinePresentation(
      terminalPresentationTargets(targets),
      TERMINAL_PRESENTATION_PROPERTIES,
    )
  )
    return null;
  return new FiniteAnimationPlayer({
    documentValue: options.root.ownerDocument,
    cues: createTerminalEntrancePlan({ targets, tier: options.tier }),
    idPrefix: "gorilla-terminal",
    label: "Terminal",
    onComplete: options.onComplete,
    onFailure: options.onFailure,
  });
}
