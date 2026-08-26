import {
  FIRST_ITEM_INDEX,
  INDEX_OFFSET,
  PAD_LENGTH,
  SELECTION_EVENT,
  type AtlasController,
  type AtlasElements,
} from "./product-atlas-contract";
import { productSlug } from "./product-atlas-elements";

const HASH_PREFIX = "#signal-";
const FALLBACK_SELECTED_LABEL = "Active frequency";
const OBSERVER_ROOT_MARGIN = "-30% 0px -62% 0px";
const ARCHIVE_INDEX_PROPERTY = "--archive-index";

function slugFromHash(windowValue: Window): string | null {
  return windowValue.location.hash.startsWith(HASH_PREFIX)
    ? windowValue.location.hash.slice(HASH_PREFIX.length)
    : null;
}

function indexForSlug(elements: AtlasElements, slug: string | null): number {
  const index = elements.links.findIndex((link) => productSlug(link) === slug);
  return index < FIRST_ITEM_INDEX ? FIRST_ITEM_INDEX : index;
}

function statusText(elements: AtlasElements, selectedIndex: number): string {
  const link = elements.links[selectedIndex];
  const selectedLabel =
    elements.root.dataset.selectedLabel ?? FALLBACK_SELECTED_LABEL;
  const productLabel = link?.textContent?.trim() ?? "";
  const itemNumber = String(selectedIndex + INDEX_OFFSET).padStart(
    PAD_LENGTH,
    "0",
  );
  const itemCount = String(elements.links.length).padStart(PAD_LENGTH, "0");
  return `${selectedLabel}: ${productLabel} · ${itemNumber} / ${itemCount}`;
}

function replaceHash(windowValue: Window, slug: string): void {
  const nextHash = `${HASH_PREFIX}${slug}`;
  if (windowValue.location.hash === nextHash) return;
  const nextUrl = new URL(windowValue.location.href);
  nextUrl.hash = nextHash;
  windowValue.history.replaceState(null, "", nextUrl);
}

function pushHash(windowValue: Window, slug: string): void {
  const nextHash = `${HASH_PREFIX}${slug}`;
  if (windowValue.location.hash === nextHash) return;
  const nextUrl = new URL(windowValue.location.href);
  nextUrl.hash = nextHash;
  windowValue.history.pushState(null, "", nextUrl);
}

function updateSelection(elements: AtlasElements, selectedIndex: number): void {
  const link = elements.links[selectedIndex];
  if (link === undefined) return;
  const slug = productSlug(link);
  if (slug === null) return;

  elements.links.forEach((item, index) => {
    if (index === selectedIndex) item.setAttribute("aria-current", "location");
    else item.removeAttribute("aria-current");
  });
  elements.panels.forEach((panel, index) => {
    panel.toggleAttribute("data-active", index === selectedIndex);
  });
  elements.root.dataset.selectedProduct = slug;
  elements.root.dataset.flavor = slug;
  elements.root.style.setProperty(
    ARCHIVE_INDEX_PROPERTY,
    String(selectedIndex),
  );
  elements.status.textContent = statusText(elements, selectedIndex);
  elements.root.dispatchEvent(
    new CustomEvent(SELECTION_EVENT, { bubbles: true }),
  );
}

function keyboardTargetIndex(
  key: string,
  currentIndex: number,
  itemCount: number,
): number | null {
  if (key === "Home") return FIRST_ITEM_INDEX;
  if (key === "End") return itemCount - INDEX_OFFSET;
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (currentIndex + INDEX_OFFSET) % itemCount;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (currentIndex - INDEX_OFFSET + itemCount) % itemCount;
  }
  return null;
}

function createChapterObserver(
  elements: AtlasElements,
  windowValue: Window,
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  return new IntersectionObserver(
    (entries: IntersectionObserverEntry[]): void => {
      const activeEntry = entries.find((entry) => entry.isIntersecting);
      if (activeEntry === undefined) return;
      const index = elements.panels.findIndex(
        (panel) => panel === activeEntry.target,
      );
      const link = elements.links[index];
      const slug = link === undefined ? null : productSlug(link);
      if (index < FIRST_ITEM_INDEX || slug === null) return;
      updateSelection(elements, index);
      replaceHash(windowValue, slug);
    },
    { rootMargin: OBSERVER_ROOT_MARGIN, threshold: FIRST_ITEM_INDEX },
  );
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

export function createAtlasSession(
  elements: AtlasElements,
  windowValue: Window,
): AtlasController {
  const abortController = new AbortController();
  const listenerOptions = { signal: abortController.signal };
  const selectFromLocation = (): void => {
    updateSelection(
      elements,
      indexForSlug(elements, slugFromHash(windowValue)),
    );
  };
  const observer = createChapterObserver(elements, windowValue);

  elements.links.forEach((link, index) => {
    link.addEventListener(
      "click",
      (): void => updateSelection(elements, index),
      listenerOptions,
    );
    link.addEventListener(
      "keydown",
      (event): void => {
        const targetIndex = keyboardTargetIndex(
          event.key,
          index,
          elements.links.length,
        );
        if (targetIndex === null) {
          return;
        }
        const target = elements.links[targetIndex];
        const panel = elements.panels[targetIndex];
        const slug = target === undefined ? null : productSlug(target);
        if (target === undefined || panel === undefined || slug === null) {
          return;
        }
        event.preventDefault();
        updateSelection(elements, targetIndex);
        pushHash(windowValue, slug);
        panel.scrollIntoView({ behavior: "auto", block: "start" });
        target.focus({ preventScroll: true });
      },
      listenerOptions,
    );
  });
  windowValue.addEventListener(
    "hashchange",
    selectFromLocation,
    listenerOptions,
  );
  windowValue.addEventListener("popstate", selectFromLocation, listenerOptions);
  elements.panels.forEach((panel) => observer?.observe(panel));

  elements.root.dataset.atlasEnhanced = "true";
  selectFromLocation();

  return {
    destroy: (): void => {
      abortController.abort();
      observer?.disconnect();
      restoreBaseline(elements);
    },
  };
}
