interface InlinePresentationTarget {
  readonly style: Pick<
    CSSStyleDeclaration,
    "getPropertyValue" | "getPropertyPriority"
  >;
}

/** Explicit plans use CSS rest poses only when no inline presentation overrides them. */
export function hasInlinePresentation(
  targets: readonly InlinePresentationTarget[],
  properties: readonly string[],
): boolean {
  return targets.some(({ style }) =>
    properties.some(
      (property) =>
        style.getPropertyValue(property) !== "" ||
        style.getPropertyPriority(property) !== "",
    ),
  );
}
