import {
  FiniteAnimationPlayer,
  supportsFiniteAnimationPlayer,
} from "../native/finite-animation-player";
import { hasInlinePresentation } from "../native/presentation-guard";
import {
  MANIFESTO_PRESENTATION_PROPERTIES,
  MANIFESTO_SELECTOR,
} from "./manifesto-motion-spec";
import { createManifestoPlan } from "./manifesto-native-plan";

import type { FiniteEntranceLifecycle } from "../native/finite-entrance-owner";
import type { ManifestoTargets } from "./manifesto-native-plan";

function requireTarget(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (element === null)
    throw new Error(`Manifesto motion hook is missing: ${selector}`);
  return element;
}

export function readManifestoTargets(root: HTMLElement): ManifestoTargets {
  return {
    handoff: requireTarget(root, MANIFESTO_SELECTOR.handoff),
    copy: requireTarget(root, MANIFESTO_SELECTOR.copy),
    lines: [...root.querySelectorAll<HTMLElement>(MANIFESTO_SELECTOR.lines)],
    transmission: [
      ...root.querySelectorAll<HTMLElement>(MANIFESTO_SELECTOR.transmission),
    ],
    signals: [
      ...root.querySelectorAll<HTMLElement>(MANIFESTO_SELECTOR.signals),
    ],
  };
}

/** Known stylesheet rest poses avoid layout/style resolution; custom inline poses use GSAP. */
export function createNativeManifesto(
  options: FiniteEntranceLifecycle & { readonly root: HTMLElement },
): FiniteAnimationPlayer | null {
  const documentValue = options.root.ownerDocument;
  const windowValue = documentValue.defaultView;
  if (windowValue === null || !supportsFiniteAnimationPlayer(windowValue))
    return null;
  const targets = readManifestoTargets(options.root);
  if (
    targets.lines.length === 0 ||
    targets.transmission.length === 0 ||
    targets.signals.length === 0
  )
    return null;
  const elements = [
    targets.handoff,
    targets.copy,
    ...targets.lines,
    ...targets.transmission,
    ...targets.signals,
  ];
  if (hasInlinePresentation(elements, MANIFESTO_PRESENTATION_PROPERTIES))
    return null;
  return new FiniteAnimationPlayer({
    documentValue,
    cues: createManifestoPlan(targets),
    idPrefix: "gorilla-manifesto",
    label: "Manifesto",
    onComplete: options.onComplete,
    onFailure: options.onFailure,
  });
}
