import type { Cleanup } from "./cleanup-stack";

export interface InlineStyleTarget {
  readonly style: Pick<
    CSSStyleDeclaration,
    | "getPropertyValue"
    | "getPropertyPriority"
    | "setProperty"
    | "removeProperty"
  >;
}

/** Restore only owned declarations, including priorities, without replacing unrelated styles. */
export function captureInlineStyles(
  targets: readonly InlineStyleTarget[],
  properties: readonly string[],
): Cleanup {
  const snapshots = targets.map(({ style }) => ({
    style,
    declarations: properties.map((property) => ({
      property,
      value: style.getPropertyValue(property),
      priority: style.getPropertyPriority(property),
    })),
  }));
  return (): void => {
    for (const { style, declarations } of snapshots) {
      for (const { property, value, priority } of declarations) {
        if (value === "") style.removeProperty(property);
        else style.setProperty(property, value, priority);
      }
    }
  };
}
