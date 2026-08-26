import {
  LOCATOR_GOOGLE_SELECTOR,
  LOCATOR_PRODUCT_SELECTOR,
  LOCATOR_SIGNAL_SELECTOR,
  LOCATOR_STATUS_SELECTOR,
  LOCATOR_VISUAL_SELECTOR,
  LOCATOR_YANDEX_SELECTOR,
  type LocatorElements,
} from "./locator-contract";
import { hasMatchingLocatorSlugs } from "./locator-state";

function isAnchor(element: Element | null): element is HTMLAnchorElement {
  return element instanceof HTMLAnchorElement;
}

function isHtmlElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isSelect(element: Element | null): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

function collectHtmlElements(
  root: ParentNode,
  selector: string,
): readonly HTMLElement[] {
  return Array.from(root.querySelectorAll(selector)).filter(isHtmlElement);
}

export function collectLocatorElements(
  root: HTMLElement,
): LocatorElements | null {
  const productSelect = root.querySelector(LOCATOR_PRODUCT_SELECTOR);
  const googleLink = root.querySelector(LOCATOR_GOOGLE_SELECTOR);
  const yandexLink = root.querySelector(LOCATOR_YANDEX_SELECTOR);
  const status = root.querySelector(LOCATOR_STATUS_SELECTOR);
  if (
    !isSelect(productSelect) ||
    !isAnchor(googleLink) ||
    !isAnchor(yandexLink) ||
    !isHtmlElement(status)
  ) {
    return null;
  }

  const productSignals = collectHtmlElements(root, LOCATOR_SIGNAL_SELECTOR);
  const productVisuals = collectHtmlElements(root, LOCATOR_VISUAL_SELECTOR);
  const slugsMatch = hasMatchingLocatorSlugs(
    [...productSelect.options].map(({ value }) => value),
    productSignals.map(({ dataset }) => dataset.locatorSignal ?? ""),
    productVisuals.map(({ dataset }) => dataset.locatorProductVisual ?? ""),
  );
  if (!slugsMatch) {
    return null;
  }

  return {
    googleLink,
    productSelect,
    productSignals,
    productVisuals,
    root,
    status,
    yandexLink,
  };
}
