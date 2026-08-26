import type { CompareElements, CompareViewModel } from "./compare-contract";
import { createFindHref } from "./compare-state";

function renderSelects(
  elements: CompareElements,
  model: CompareViewModel,
): void {
  elements.selects.forEach((select, index) => {
    const isAvailable = index < model.slotLimit;
    const value = model.selection[index] ?? "";
    elements.slotWrappers[index]?.toggleAttribute("hidden", !isAvailable);
    select.disabled = !isAvailable;
    select.value = value;

    for (const option of select.options) {
      option.disabled =
        option.value !== "" &&
        option.value !== value &&
        model.selection.includes(option.value);
    }
  });
}

function renderProducts(
  elements: CompareElements,
  selection: readonly string[],
): void {
  for (const product of elements.products) {
    const slug = product.dataset.productSlug;
    const isSelected = slug !== undefined && selection.includes(slug);
    product.toggleAttribute("hidden", !isSelected);
    product.toggleAttribute("data-motion-selected", isSelected);
  }
}
function renderMatrix(
  elements: CompareElements,
  selection: readonly string[],
): void {
  for (const cell of elements.matrixCells) {
    const slug = cell.dataset.productSlug;
    cell.toggleAttribute(
      "hidden",
      slug === undefined || !selection.includes(slug),
    );
  }
}

function orderedProducts(
  products: readonly HTMLElement[],
  selection: readonly string[],
): readonly HTMLElement[] {
  const selected = selection.flatMap((slug) =>
    products.filter((product) => product.dataset.productSlug === slug),
  );
  const remainder = products.filter(
    (product) => !selection.includes(product.dataset.productSlug ?? ""),
  );
  return [...selected, ...remainder];
}

function renderProductOrder(
  elements: CompareElements,
  selection: readonly string[],
): void {
  for (const product of orderedProducts(elements.products, selection)) {
    elements.emptyState.before(product);
  }
}

function renderFindLink(
  elements: CompareElements,
  model: CompareViewModel,
): void {
  const findBase = elements.findLink.dataset.findBase;
  if (findBase === undefined || findBase === "") {
    return;
  }

  elements.findLink.href = createFindHref(
    findBase,
    model.origin,
    model.selection,
  );
  elements.findLink.textContent =
    model.selection[0] === undefined
      ? (elements.findLink.dataset.findDefaultLabel ?? "")
      : (elements.findLink.dataset.findSelectedLabel ?? "");
}

export function renderCompareView(
  elements: CompareElements,
  model: CompareViewModel,
): void {
  renderSelects(elements, model);
  renderProducts(elements, model.selection);
  renderMatrix(elements, model.selection);
  renderProductOrder(elements, model.selection);
  elements.emptyState.toggleAttribute("hidden", model.selection.length > 0);
  elements.clearButton.disabled = model.selection.length === 0;
  elements.root.dataset.selectionCount = String(model.selection.length);
  renderFindLink(elements, model);
}

export function resetCompareView(elements: CompareElements): void {
  for (const product of elements.products) {
    product.removeAttribute("data-motion-selected");
    elements.emptyState.before(product);
  }
  for (const cell of elements.matrixCells) {
    cell.removeAttribute("hidden");
  }
  delete elements.root.dataset.compareEnhanced;
  delete elements.root.dataset.selectionCount;
}
