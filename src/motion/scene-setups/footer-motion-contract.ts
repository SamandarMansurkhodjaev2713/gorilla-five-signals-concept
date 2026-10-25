export const FOOTER_SIGNAL_SELECTOR = "[data-motion-signal]";
export const FOOTER_COPY_SELECTOR = "[data-motion-copy]";
export const FOOTER_PRESENTATION_SELECTOR = [
  FOOTER_SIGNAL_SELECTOR,
  FOOTER_COPY_SELECTOR,
].join(", ");
export const FOOTER_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;

export interface FooterEntranceTargets {
  readonly signals: readonly HTMLElement[];
  readonly copy: readonly HTMLElement[];
}

export function readFooterEntranceTargets(
  root: HTMLElement,
): FooterEntranceTargets {
  return {
    signals: [...root.querySelectorAll<HTMLElement>(FOOTER_SIGNAL_SELECTOR)],
    copy: [...root.querySelectorAll<HTMLElement>(FOOTER_COPY_SELECTOR)],
  };
}

export function footerPresentationTargets(
  targets: FooterEntranceTargets,
): readonly HTMLElement[] {
  return [...targets.signals, ...targets.copy];
}
