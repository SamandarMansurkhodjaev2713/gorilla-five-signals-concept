export const ATLAS_ROOT_SELECTOR = "[data-atlas-root]";
export const PANEL_SELECTOR = "[data-atlas-panel]";
export const LINK_SELECTOR = "[data-atlas-link]";
export const NAV_SELECTOR = "[data-atlas-nav]";
export const STATUS_SELECTOR = "[data-atlas-status]";
export const SELECTION_EVENT = "gorilla:selection-change";
export const FIRST_ITEM_INDEX = 0;
export const INDEX_OFFSET = 1;
export const PAD_LENGTH = 2;

export interface AtlasController {
  destroy(): void;
}

export interface AtlasElements {
  readonly links: readonly HTMLAnchorElement[];
  readonly nav: HTMLElement;
  readonly panels: readonly HTMLElement[];
  readonly root: HTMLElement;
  readonly status: HTMLElement;
}
