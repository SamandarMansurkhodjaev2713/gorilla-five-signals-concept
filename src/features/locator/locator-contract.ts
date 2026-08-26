export const LOCATOR_ROOT_SELECTOR = "[data-locator-handoff]";
export const LOCATOR_PRODUCT_SELECTOR = "[data-locator-product]";
export const LOCATOR_GOOGLE_SELECTOR = "[data-locator-google]";
export const LOCATOR_YANDEX_SELECTOR = "[data-locator-yandex]";
export const LOCATOR_STATUS_SELECTOR = "[data-locator-status]";
export const LOCATOR_SIGNAL_SELECTOR = "[data-locator-signal]";
export const LOCATOR_VISUAL_SELECTOR = "[data-locator-product-visual]";
export const LOCATOR_PRODUCT_QUERY_KEY = "product";
export const DEFAULT_LOCATOR_FLAVOR = "original";

export interface LocatorController {
  destroy(): void;
}

export interface LocatorElements {
  readonly googleLink: HTMLAnchorElement;
  readonly productSelect: HTMLSelectElement;
  readonly productSignals: readonly HTMLElement[];
  readonly productVisuals: readonly HTMLElement[];
  readonly root: HTMLElement;
  readonly status: HTMLElement;
  readonly yandexLink: HTMLAnchorElement;
}

export interface LocatorViewModel {
  readonly slug: string;
}
