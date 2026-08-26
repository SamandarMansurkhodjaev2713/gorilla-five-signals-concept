export const COMPARE_ROOT_SELECTOR = "[data-compare-root]";
export const PRODUCT_SELECTOR = "[data-compare-product]";
export const PRODUCT_PARAMETER = "products";
export const DESKTOP_QUERY = "(min-width: 80rem)";
export const MOBILE_SLOT_LIMIT = 2;
export const DESKTOP_SLOT_LIMIT = 3;

export type CompareViewport = "compact" | "desktop";

export interface CompareController {
  destroy(): void;
}

export interface CompareElements {
  readonly clearButton: HTMLButtonElement;
  readonly copyButton: HTMLButtonElement;
  readonly emptyState: HTMLElement;
  readonly findLink: HTMLAnchorElement;
  readonly matrixCells: readonly HTMLTableCellElement[];
  readonly products: readonly HTMLElement[];
  readonly root: HTMLElement;
  readonly selects: readonly HTMLSelectElement[];
  readonly slotWrappers: readonly HTMLElement[];
  readonly status: HTMLElement;
}

export interface CompareViewModel {
  readonly origin: string;
  readonly selection: readonly string[];
  readonly slotLimit: number;
}
