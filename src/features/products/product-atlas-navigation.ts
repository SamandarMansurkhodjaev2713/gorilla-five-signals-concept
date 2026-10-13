import type { AtlasElements } from "./product-atlas-contract";
import { productSlug } from "./product-atlas-elements";
import { setHash, updateSelection } from "./product-atlas-selection";

type HistoryMode = "push" | "replace";

export interface AtlasNavigator {
  destroy(): void;
  isPending(): boolean;
  navigate(index: number, mode: HistoryMode): HTMLAnchorElement | null;
}

export function createAtlasNavigator(
  elements: AtlasElements,
  windowValue: Window,
): AtlasNavigator {
  let frameId: number | null = null;
  let pendingIndex: number | null = null;

  const cancelFrame = (): void => {
    if (frameId !== null) windowValue.cancelAnimationFrame(frameId);
    frameId = null;
  };

  return {
    destroy: (): void => {
      cancelFrame();
      pendingIndex = null;
    },
    isPending: (): boolean => pendingIndex !== null,
    navigate: (index, mode): HTMLAnchorElement | null => {
      const target = elements.links[index];
      const panel = elements.panels[index];
      const slug = target === undefined ? null : productSlug(target);
      if (target === undefined || panel === undefined || slug === null) {
        return null;
      }

      cancelFrame();
      pendingIndex = index;
      panel.scrollIntoView({ behavior: "auto", block: "start" });
      frameId = windowValue.requestAnimationFrame((): void => {
        if (pendingIndex !== index) return;
        updateSelection(elements, index);
        setHash(windowValue, slug, mode);
        pendingIndex = null;
        frameId = null;
      });
      return target;
    },
  };
}
