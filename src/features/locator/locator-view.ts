import type { LocatorElements, LocatorViewModel } from "./locator-contract";
import {
  createLocatorPresentation,
  DEFAULT_LOCATOR_LABEL,
} from "./locator-presentation";

function selectedLabel(select: HTMLSelectElement): string {
  return (
    select.selectedOptions[0]?.textContent?.trim() ?? DEFAULT_LOCATOR_LABEL
  );
}

function renderSignals(
  signals: readonly HTMLElement[],
  selectedSlug: string,
): void {
  for (const signal of signals) {
    const isActive =
      selectedSlug === "" || signal.dataset.locatorSignal === selectedSlug;
    signal.toggleAttribute("data-active", isActive);
  }
}

function renderVisuals(
  visuals: readonly HTMLElement[],
  selectedSlug: string,
): void {
  for (const visual of visuals) {
    const isVisible =
      selectedSlug === "" ||
      visual.dataset.locatorProductVisual === selectedSlug;
    visual.toggleAttribute("hidden", !isVisible);
  }
}

export function renderLocator(
  elements: LocatorElements,
  model: LocatorViewModel,
): void {
  elements.productSelect.value = model.slug;
  const selectedSlug = elements.productSelect.value;
  const label = selectedLabel(elements.productSelect);
  const presentation = createLocatorPresentation(label, selectedSlug);
  elements.root.dataset.flavor = presentation.flavor;
  elements.root.dataset.locatorSelection = presentation.selection;
  elements.googleLink.href = presentation.googleUrl;
  elements.yandexLink.href = presentation.yandexUrl;
  elements.status.textContent = presentation.status;
  renderSignals(elements.productSignals, selectedSlug);
  renderVisuals(elements.productVisuals, selectedSlug);
}
