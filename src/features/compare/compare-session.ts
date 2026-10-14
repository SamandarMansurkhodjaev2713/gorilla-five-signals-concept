import {
  DEFAULT_SELECTION_COUNT,
  DESKTOP_QUERY,
  type CompareController,
  type CompareElements,
} from "./compare-contract";
import { bindCompareEvents } from "./compare-events";
import {
  createCompareFieldCue,
  type CompareFieldCue,
} from "./compare-field-cue";
import {
  createCompareShareIntent,
  type CompareShareIntent,
} from "./compare-share-intent";
import {
  createCompareLocationStore,
  type CompareLocationStore,
} from "./compare-location-store";
import {
  isPresent,
  slotLimitForViewport,
  uniqueValidSlugs,
} from "./compare-state";
import { renderCompareView, resetCompareView } from "./compare-view";

class CompareSession implements CompareController {
  readonly #abortController = new AbortController();
  readonly #defaults: readonly string[];
  readonly #desktopQuery: MediaQueryList;
  readonly #fieldCue: CompareFieldCue;
  readonly #locationStore: CompareLocationStore;
  readonly #shareIntent: CompareShareIntent;
  readonly #validSlugs: ReadonlySet<string>;
  #selection: readonly string[] = [];
  #slotLimit: number;

  constructor(
    readonly elements: CompareElements,
    readonly windowValue: Window,
  ) {
    this.#desktopQuery = windowValue.matchMedia(DESKTOP_QUERY);
    this.#validSlugs = new Set(
      elements.products
        .map((product) => product.dataset.productSlug)
        .filter(isPresent),
    );
    this.#defaults = [...this.#validSlugs].slice(0, DEFAULT_SELECTION_COUNT);
    this.#slotLimit = slotLimitForViewport(
      this.#desktopQuery.matches ? "desktop" : "compact",
    );
    this.#locationStore = createCompareLocationStore({
      defaults: this.#defaults,
      validSlugs: this.#validSlugs,
      windowValue,
    });
    this.#fieldCue = createCompareFieldCue({
      elements,
      signal: this.#abortController.signal,
      windowValue,
    });
    this.#shareIntent = createCompareShareIntent({
      announceCopied: (): void => {
        this.#announce(this.elements.root.dataset.copiedLabel);
      },
      announceFailed: (): void => {
        this.#announce(this.elements.root.dataset.copyFailedLabel);
      },
      clipboard: windowValue.navigator.clipboard,
      locationHref: (): string => windowValue.location.href,
      root: elements.root,
      signal: this.#abortController.signal,
    });
    this.#start();
  }

  #announce(message: string | undefined): void {
    this.elements.status.textContent = message ?? "";
  }

  #render(): void {
    renderCompareView(this.elements, {
      origin: this.windowValue.location.origin,
      selection: this.#selection,
      slotLimit: this.#slotLimit,
    });
  }

  #writeUrl(): void {
    this.#locationStore.write(this.#selection);
  }

  #publishSelection(): void {
    this.#render();
    this.#writeUrl();
    this.#announce(this.elements.root.dataset.updatedLabel);
    this.#fieldCue.trigger();
    this.elements.root.dispatchEvent(
      new CustomEvent("gorilla:selection-change", {
        bubbles: true,
        detail: { products: this.#selection },
      }),
    );
  }

  #readLocation(canonicalize: "canonicalize" | "preserve"): void {
    this.#selection = this.#locationStore.read(this.#slotLimit, canonicalize);
    this.#render();
  }

  readonly #handleSelection = (event: Event): void => {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }
    const slotIndex = this.elements.selects.indexOf(event.target);
    if (slotIndex < 0 || slotIndex >= this.#slotLimit) {
      return;
    }
    const values = this.elements.selects
      .slice(0, this.#slotLimit)
      .map((select) => select.value);
    this.#selection = uniqueValidSlugs(
      values,
      this.#validSlugs,
      this.#slotLimit,
    );
    this.#publishSelection();
  };

  readonly #clearSelection = (): void => {
    this.#selection = [];
    this.#publishSelection();
    this.#announce(this.elements.root.dataset.clearedLabel);
    this.elements.selects[0]?.focus();
  };

  readonly #handleCopy = (): void => {
    void this.#shareIntent.copy(this.#selection);
  };

  readonly #handleViewportChange = (): void => {
    const nextLimit = slotLimitForViewport(
      this.#desktopQuery.matches ? "desktop" : "compact",
    );
    if (nextLimit === this.#slotLimit) {
      return;
    }
    this.#slotLimit = nextLimit;
    const bounded = this.#selection.slice(0, nextLimit);
    const didTrim = bounded.length !== this.#selection.length;
    this.#selection = bounded;
    this.#render();
    if (didTrim) {
      this.#writeUrl();
    }
  };

  #start(): void {
    bindCompareEvents({
      desktopQuery: this.#desktopQuery,
      elements: this.elements,
      handlers: {
        clearSelection: this.#clearSelection,
        copySelection: this.#handleCopy,
        locationChange: this.#handleLocationChange,
        selectionChange: this.#handleSelection,
        viewportChange: this.#handleViewportChange,
      },
      signal: this.#abortController.signal,
      windowValue: this.windowValue,
    });
    this.#readLocation("canonicalize");
    this.#fieldCue.trigger();
    this.elements.root.dataset.compareEnhanced = "true";
    this.elements.root
      .querySelector("[data-compare-enhanced]")
      ?.removeAttribute("hidden");
  }

  readonly #handleLocationChange = (): void => {
    this.#readLocation("preserve");
  };

  destroy(): void {
    this.#abortController.abort();
    this.#fieldCue.destroy();
    resetCompareView(this.elements);
  }
}

export function createCompareSession(
  elements: CompareElements,
  windowValue: Window,
): CompareController {
  return new CompareSession(elements, windowValue);
}
