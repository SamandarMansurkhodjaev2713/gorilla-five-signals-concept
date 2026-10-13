import {
  FIRST_ITEM_INDEX,
  type AtlasController,
  type AtlasElements,
} from "./product-atlas-contract";
import { productSlug } from "./product-atlas-elements";
import {
  createAtlasNavigator,
  type AtlasNavigator,
} from "./product-atlas-navigation";
import { createChapterObserver } from "./product-atlas-observer";
import {
  indexForSlug,
  keyboardTargetIndex,
  setHash,
  slugFromHash,
  updateSelection,
} from "./product-atlas-selection";

const ARCHIVE_INDEX_PROPERTY = "--archive-index";

function synchronizeLocation(
  elements: AtlasElements,
  windowValue: Window,
  navigator: AtlasNavigator,
): number {
  const requestedSlug = slugFromHash(windowValue);
  const index = indexForSlug(elements, requestedSlug);
  if (requestedSlug === null) updateSelection(elements, index);
  else navigator.navigate(index, "replace");
  return index;
}

function restoreBaseline(elements: AtlasElements): void {
  delete elements.root.dataset.atlasEnhanced;
  delete elements.root.dataset.selectedProduct;
  const firstSlug = productSlug(
    elements.links[FIRST_ITEM_INDEX] ?? elements.root,
  );
  if (firstSlug !== null) elements.root.dataset.flavor = firstSlug;
  elements.root.style.setProperty(ARCHIVE_INDEX_PROPERTY, "0");
  elements.links.forEach((link, index) => {
    if (index === FIRST_ITEM_INDEX)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  elements.panels.forEach((panel, index) => {
    panel.toggleAttribute("data-active", index === FIRST_ITEM_INDEX);
  });
}

function handleLinkKeydown(
  event: KeyboardEvent,
  elements: AtlasElements,
  navigator: AtlasNavigator,
  index: number,
): void {
  const targetIndex = keyboardTargetIndex(
    event.key,
    index,
    elements.links.length,
  );
  if (targetIndex === null) return;
  const target = navigator.navigate(targetIndex, "push");
  if (target === null) return;
  event.preventDefault();
  target.focus({ preventScroll: true });
}

function mountLinkListeners(
  elements: AtlasElements,
  navigator: AtlasNavigator,
  listenerOptions: AddEventListenerOptions,
): void {
  elements.links.forEach((link, index) => {
    link.addEventListener(
      "click",
      (event): void => {
        if (navigator.navigate(index, "push") !== null) {
          event.preventDefault();
        }
      },
      listenerOptions,
    );
    link.addEventListener(
      "keydown",
      (event): void => handleLinkKeydown(event, elements, navigator, index),
      listenerOptions,
    );
  });
}

function mountLocationListeners(
  elements: AtlasElements,
  windowValue: Window,
  navigator: AtlasNavigator,
  listenerOptions: AddEventListenerOptions,
): void {
  const synchronize = (): void => {
    synchronizeLocation(elements, windowValue, navigator);
  };
  windowValue.addEventListener("hashchange", synchronize, listenerOptions);
  windowValue.addEventListener("popstate", synchronize, listenerOptions);
}

function mountInitialState(
  elements: AtlasElements,
  windowValue: Window,
  navigator: AtlasNavigator,
): void {
  elements.root.dataset.atlasEnhanced = "true";
  synchronizeLocation(elements, windowValue, navigator);
}

export function createAtlasSession(
  elements: AtlasElements,
  windowValue: Window,
): AtlasController {
  const abortController = new AbortController();
  const listenerOptions = { signal: abortController.signal };
  const navigator = createAtlasNavigator(elements, windowValue);
  mountLinkListeners(elements, navigator, listenerOptions);
  mountLocationListeners(elements, windowValue, navigator, listenerOptions);
  mountInitialState(elements, windowValue, navigator);

  const observer = createChapterObserver(
    elements,
    windowValue,
    (index): void => {
      if (navigator.isPending()) return;
      const link = elements.links[index];
      const slug = link === undefined ? null : productSlug(link);
      if (slug === null || !updateSelection(elements, index)) return;
      setHash(windowValue, slug, "replace");
    },
  );
  elements.panels.forEach((panel) => observer?.observe(panel));

  return {
    destroy: (): void => {
      abortController.abort();
      observer?.disconnect();
      navigator.destroy();
      restoreBaseline(elements);
    },
  };
}
