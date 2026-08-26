import {
  DESKTOP_QUERY,
  type CompareController,
  type CompareElements,
  type CompareViewport,
} from "./compare-contract";
import { copyCompareSelection, recordCopyFailure } from "./compare-clipboard";
import { bindCompareEvents } from "./compare-events";
import {
  createShareUrl,
  isPresent,
  selectionFromUrl,
  slotLimitForViewport,
  uniqueValidSlugs,
} from "./compare-state";
import { renderCompareView, resetCompareView } from "./compare-view";

function isHistoryRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class CompareSession implements CompareController {
  readonly #abortController = new AbortController();
  readonly #defaults: readonly string[];
  readonly #desktopQuery: MediaQueryList;
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
    this.#defaults = [...this.#validSlugs].slice(
      0,
      slotLimitForViewport("compact"),
    );
    this.#slotLimit = this.#readSlotLimit();
    this.#start();
  }

  #readViewport(): CompareViewport {
    return this.#desktopQuery.matches ? "desktop" : "compact";
  }

  #readSlotLimit(): number {
    return slotLimitForViewport(this.#readViewport());
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
    const url = createShareUrl(this.windowValue.location.href, this.#selection);
    const currentState: unknown = this.windowValue.history.state;
    const state = {
      ...(isHistoryRecord(currentState) ? currentState : {}),
      products: this.#selection,
    };

    // Compare selection is an in-page state, not a document navigation. Using
    // replaceState preserves Astro's router index and scroll coordinates while
    // keeping the current composition shareable and reload-safe.
    this.windowValue.history.replaceState(state, "", url);
  }

  #publishSelection(): void {
    this.#render();
    this.#writeUrl();
    this.#announce(this.elements.root.dataset.updatedLabel);
    this.elements.root.dispatchEvent(
      new CustomEvent("gorilla:selection-change", {
        bubbles: true,
        detail: { products: this.#selection },
      }),
    );
  }

  #readLocation(canonicalize: "canonicalize" | "preserve"): void {
    const url = new URL(this.windowValue.location.href);
    this.#selection = selectionFromUrl(
      url,
      this.#defaults,
      this.#validSlugs,
      this.#slotLimit,
    );
    this.#render();
    const canonical = createShareUrl(url, this.#selection);
    if (canonicalize === "canonicalize" && canonical.href !== url.href) {
      const currentState: unknown = this.windowValue.history.state;
      this.windowValue.history.replaceState(
        {
          ...(isHistoryRecord(currentState) ? currentState : {}),
          products: this.#selection,
        },
        "",
        canonical,
      );
    }
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
    void copyCompareSelection({
      clipboard: this.windowValue.navigator.clipboard,
      locationHref: this.windowValue.location.href,
      root: this.elements.root,
      selection: this.#selection,
    })
      .then((): void => {
        delete this.elements.root.dataset.compareCopyError;
        this.#announce(this.elements.root.dataset.copiedLabel);
      })
      .catch((error: unknown): void => {
        recordCopyFailure(this.elements.root, error);
        this.#announce(this.elements.root.dataset.copyFailedLabel);
      });
  };

  readonly #handleViewportChange = (): void => {
    const nextLimit = this.#readSlotLimit();
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
    resetCompareView(this.elements);
  }
}

export function createCompareSession(
  elements: CompareElements,
  windowValue: Window,
): CompareController {
  return new CompareSession(elements, windowValue);
}
