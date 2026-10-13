import {
  FIRST_ITEM_INDEX,
  INDEX_OFFSET,
  PAD_LENGTH,
  SELECTION_EVENT,
  type AtlasElements,
} from "./product-atlas-contract";
import { productSlug } from "./product-atlas-elements";

const HASH_PREFIX = "#signal-";
const FALLBACK_SELECTED_LABEL = "Active frequency";
const ARCHIVE_INDEX_PROPERTY = "--archive-index";

export function slugFromHash(windowValue: Window): string | null {
  return windowValue.location.hash.startsWith(HASH_PREFIX)
    ? windowValue.location.hash.slice(HASH_PREFIX.length)
    : null;
}

export function indexForSlug(
  elements: AtlasElements,
  slug: string | null,
): number {
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

export function setHash(
  windowValue: Window,
  slug: string,
  mode: "push" | "replace",
): void {
  const nextHash = `${HASH_PREFIX}${slug}`;
  if (windowValue.location.hash === nextHash) return;
  const nextUrl = new URL(windowValue.location.href);
  nextUrl.hash = nextHash;
  const method = mode === "push" ? "pushState" : "replaceState";
  windowValue.history[method](null, "", nextUrl);
}

export function updateSelection(
  elements: AtlasElements,
  selectedIndex: number,
): boolean {
  const link = elements.links[selectedIndex];
  if (link === undefined) return false;
  const slug = productSlug(link);
  if (slug === null || elements.root.dataset.selectedProduct === slug) {
    return false;
  }

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
  return true;
}

export function keyboardTargetIndex(
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
