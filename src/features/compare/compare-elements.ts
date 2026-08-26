import {
  DESKTOP_SLOT_LIMIT,
  PRODUCT_SELECTOR,
  type CompareElements,
} from "./compare-contract";

type ElementGuard<ElementType extends Element> = (
  element: Element,
) => element is ElementType;

function queryElement<ElementType extends Element>(
  root: ParentNode,
  selector: string,
  guard: ElementGuard<ElementType>,
): ElementType | null {
  const element = root.querySelector(selector);
  return element !== null && guard(element) ? element : null;
}

function queryElements<ElementType extends Element>(
  root: ParentNode,
  selector: string,
  guard: ElementGuard<ElementType>,
): readonly ElementType[] {
  return Array.from(root.querySelectorAll(selector)).filter(guard);
}

const isButton = (element: Element): element is HTMLButtonElement =>
  element instanceof HTMLButtonElement;
const isAnchor = (element: Element): element is HTMLAnchorElement =>
  element instanceof HTMLAnchorElement;
const isHtmlElement = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement;
const isSelect = (element: Element): element is HTMLSelectElement =>
  element instanceof HTMLSelectElement;
const isTableCell = (element: Element): element is HTMLTableCellElement =>
  element instanceof HTMLTableCellElement;

interface CompareElementCandidates {
  readonly clearButton: HTMLButtonElement | null;
  readonly copyButton: HTMLButtonElement | null;
  readonly emptyState: HTMLElement | null;
  readonly findLink: HTMLAnchorElement | null;
  readonly matrixCells: readonly HTMLTableCellElement[];
  readonly products: readonly HTMLElement[];
  readonly root: HTMLElement;
  readonly selects: readonly HTMLSelectElement[];
  readonly slotWrappers: readonly HTMLElement[];
  readonly status: HTMLElement | null;
}

function collectCandidates(root: HTMLElement): CompareElementCandidates {
  return {
    clearButton: queryElement(root, "[data-compare-clear]", isButton),
    copyButton: queryElement(root, "[data-compare-copy]", isButton),
    emptyState: queryElement(root, "[data-compare-empty]", isHtmlElement),
    findLink: queryElement(root, "[data-compare-find]", isAnchor),
    matrixCells: queryElements(
      root,
      "[data-compare-matrix] [data-product-slug]",
      isTableCell,
    ),
    products: queryElements(root, PRODUCT_SELECTOR, isHtmlElement),
    root,
    selects: queryElements(root, "[data-compare-slot]", isSelect),
    slotWrappers: queryElements(
      root,
      "[data-compare-slot-wrapper]",
      isHtmlElement,
    ),
    status: queryElement(root, "[data-compare-status]", isHtmlElement),
  };
}

function isComplete(
  candidates: CompareElementCandidates,
): candidates is CompareElements {
  return (
    candidates.clearButton !== null &&
    candidates.copyButton !== null &&
    candidates.emptyState !== null &&
    candidates.findLink !== null &&
    candidates.status !== null &&
    candidates.selects.length === DESKTOP_SLOT_LIMIT &&
    candidates.slotWrappers.length === DESKTOP_SLOT_LIMIT &&
    candidates.matrixCells.length > 0 &&
    candidates.products.length > 0
  );
}

export function collectCompareElements(
  root: HTMLElement,
): CompareElements | null {
  const candidates = collectCandidates(root);
  return isComplete(candidates) ? candidates : null;
}
