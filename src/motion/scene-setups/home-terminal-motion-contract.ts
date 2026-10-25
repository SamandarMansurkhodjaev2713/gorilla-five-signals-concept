export const TERMINAL_COPY_SELECTOR = ".tashkent-terminal__copy > *";
export const TERMINAL_FIELD_SELECTOR = ".tashkent-terminal__field";
export const TERMINAL_WORD_SELECTOR = ".tashkent-terminal__word";
export const TERMINAL_COORDINATE_SELECTOR = ".tashkent-terminal__coordinate";
export const TERMINAL_ROUTE_SELECTOR = ".tashkent-terminal__route";
export const TERMINAL_NODE_SELECTOR = ".tashkent-terminal__route i";
export const TERMINAL_LOCATOR_SELECTOR = ".tashkent-terminal__locator";
export const TERMINAL_LOCATOR_COPY_SELECTOR =
  ".tashkent-terminal__locator > :not(.tashkent-terminal__grid):not(.tashkent-terminal__marker)";
export const TERMINAL_LOCATOR_SIGNAL_SELECTOR = [
  ".tashkent-terminal__grid",
  ".tashkent-terminal__marker",
].join(", ");
export const TERMINAL_TRACE_SELECTOR = [
  TERMINAL_WORD_SELECTOR,
  TERMINAL_ROUTE_SELECTOR,
  TERMINAL_COORDINATE_SELECTOR,
].join(", ");
export const TERMINAL_PRESENTATION_SELECTOR = [
  TERMINAL_COPY_SELECTOR,
  TERMINAL_FIELD_SELECTOR,
  TERMINAL_TRACE_SELECTOR,
  TERMINAL_NODE_SELECTOR,
  TERMINAL_LOCATOR_SELECTOR,
  TERMINAL_LOCATOR_COPY_SELECTOR,
  TERMINAL_LOCATOR_SIGNAL_SELECTOR,
].join(", ");
export const TERMINAL_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
] as const;

export interface TerminalEntranceTargets {
  readonly copy: readonly HTMLElement[];
  readonly field: HTMLElement;
  readonly word: HTMLElement;
  readonly trace: readonly HTMLElement[];
  readonly nodes: readonly HTMLElement[];
  readonly locator: HTMLElement;
  readonly locatorSignals: readonly HTMLElement[];
  readonly locatorCopy: readonly HTMLElement[];
}

function requireTarget(root: HTMLElement, selector: string): HTMLElement {
  const target = root.querySelector<HTMLElement>(selector);
  if (target === null)
    throw new Error(`Terminal motion hook is missing: ${selector}`);
  return target;
}

export function readTerminalEntranceTargets(
  root: HTMLElement,
): TerminalEntranceTargets {
  return {
    copy: [...root.querySelectorAll<HTMLElement>(TERMINAL_COPY_SELECTOR)],
    field: requireTarget(root, TERMINAL_FIELD_SELECTOR),
    word: requireTarget(root, TERMINAL_WORD_SELECTOR),
    trace: [...root.querySelectorAll<HTMLElement>(TERMINAL_TRACE_SELECTOR)],
    nodes: [...root.querySelectorAll<HTMLElement>(TERMINAL_NODE_SELECTOR)],
    locator: requireTarget(root, TERMINAL_LOCATOR_SELECTOR),
    locatorSignals: [
      ...root.querySelectorAll<HTMLElement>(TERMINAL_LOCATOR_SIGNAL_SELECTOR),
    ],
    locatorCopy: [
      ...root.querySelectorAll<HTMLElement>(TERMINAL_LOCATOR_COPY_SELECTOR),
    ],
  };
}

export function terminalPresentationTargets(
  targets: TerminalEntranceTargets,
): readonly HTMLElement[] {
  return [
    ...targets.copy,
    targets.field,
    ...targets.trace,
    ...targets.nodes,
    targets.locator,
    ...targets.locatorSignals,
    ...targets.locatorCopy,
  ];
}
