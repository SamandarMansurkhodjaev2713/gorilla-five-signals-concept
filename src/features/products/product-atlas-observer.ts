import { FIRST_ITEM_INDEX, type AtlasElements } from "./product-atlas-contract";

const OBSERVER_ROOT_MARGIN = "-30% 0px -62% 0px";
const SCAN_LINE_VIEWPORT_RATIO = 0.3;

function closestActiveEntry(
  entries: readonly IntersectionObserverEntry[],
  windowValue: Window,
): IntersectionObserverEntry | null {
  const scanLine = windowValue.innerHeight * SCAN_LINE_VIEWPORT_RATIO;
  const activeEntries = entries.filter((entry) => entry.isIntersecting);
  return (
    activeEntries.toSorted(
      (left, right) =>
        Math.abs(left.boundingClientRect.top - scanLine) -
        Math.abs(right.boundingClientRect.top - scanLine),
    )[FIRST_ITEM_INDEX] ?? null
  );
}

export function createChapterObserver(
  elements: AtlasElements,
  windowValue: Window,
  onChapter: (index: number) => void,
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  return new IntersectionObserver(
    (entries: IntersectionObserverEntry[]): void => {
      const activeEntry = closestActiveEntry(entries, windowValue);
      if (activeEntry === null) return;
      const index = elements.panels.findIndex(
        (panel) => panel === activeEntry.target,
      );
      if (index >= FIRST_ITEM_INDEX) onChapter(index);
    },
    { rootMargin: OBSERVER_ROOT_MARGIN, threshold: FIRST_ITEM_INDEX },
  );
}
