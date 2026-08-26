import {
  collectExplorerElements,
  explorerProducts,
  PRODUCT_SELECTOR,
  renderExplorerSelection,
  type ExplorerElements,
  type ExplorerProduct,
} from "./product-explorer-dom";
import {
  createProductExplorerMediaPreloader,
  type ProductExplorerMediaPreloader,
} from "./product-explorer-media";
import {
  resolveInitialProduct,
  resolveRelativeProduct,
  type SelectionDirection,
} from "./product-explorer-state";
import {
  requestedProductFromUrl,
  updateLocaleProductLinks,
  updateProductUrl,
} from "./product-explorer-url";
import { mountFlavorReactorInteraction } from "../flavor-reactor/flavor-reactor-interaction";

export interface ProductExplorerController {
  destroy(): void;
}

interface ProductExplorerOptions {
  readonly windowValue?: Window;
}

function inertController(): ProductExplorerController {
  return { destroy: (): void => undefined };
}

class ProductExplorerSession implements ProductExplorerController {
  private readonly abortController = new AbortController();
  private readonly productsBySlug: ReadonlyMap<string, ExplorerProduct>;
  private readonly slugs: readonly string[];
  private readonly slugSet: ReadonlySet<string>;
  private interactionCleanup: (() => void) | null = null;
  private mediaPreloader: ProductExplorerMediaPreloader | null = null;
  private selectedSlug: string;

  constructor(
    private readonly documentRoot: Document,
    private readonly windowValue: Window,
    private readonly elements: ExplorerElements,
    products: readonly ExplorerProduct[],
    initialSlug: string,
  ) {
    this.productsBySlug = new Map(
      products.map((product) => [product.slug, product]),
    );
    this.slugs = products.map((product) => product.slug);
    this.slugSet = new Set(this.slugs);
    this.selectedSlug = initialSlug;
  }

  mount(): void {
    this.elements.root.addEventListener("click", this.handleClick, {
      signal: this.abortController.signal,
    });
    this.elements.previousButton.addEventListener(
      "click",
      (): void => this.selectRelative("previous"),
      { signal: this.abortController.signal },
    );
    this.elements.nextButton.addEventListener(
      "click",
      (): void => this.selectRelative("next"),
      { signal: this.abortController.signal },
    );
    this.windowValue.addEventListener("popstate", this.handlePopState, {
      signal: this.abortController.signal,
    });
    this.interactionCleanup = mountFlavorReactorInteraction({
      root: this.elements.root,
      listen: this.listen,
      requestFrame: this.requestFrame,
    });
    this.render(this.selectedSlug, false);
    this.mediaPreloader = createProductExplorerMediaPreloader(
      this.elements.root,
    );
  }

  destroy(): void {
    this.abortController.abort();
    this.interactionCleanup?.();
    this.interactionCleanup = null;
    this.mediaPreloader?.destroy();
    this.mediaPreloader = null;
  }

  private readonly listen = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options: AddEventListenerOptions = {},
  ): void => {
    target.addEventListener(type, listener, {
      ...options,
      signal: this.abortController.signal,
    });
  };

  private readonly requestFrame = (
    callback: FrameRequestCallback,
  ): (() => void) => {
    const frameId = this.windowValue.requestAnimationFrame(callback);
    return (): void => this.windowValue.cancelAnimationFrame(frameId);
  };

  private readonly handleClick = (event: Event): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const selector = event.target.closest<HTMLButtonElement>(PRODUCT_SELECTOR);
    const slug = selector?.dataset.productSelector;
    if (slug !== undefined && this.slugSet.has(slug)) {
      this.select(slug);
    }
  };

  private readonly handlePopState = (): void => {
    const requested = requestedProductFromUrl(
      this.windowValue.location.href,
      this.slugSet,
    );
    const slug = resolveInitialProduct(this.slugs, requested);
    if (slug !== null) {
      this.render(slug, true);
    }
  };

  private select(slug: string): void {
    updateProductUrl(this.windowValue, slug, "push");
    this.render(slug, true);
  }

  private selectRelative(direction: SelectionDirection): void {
    const slug = resolveRelativeProduct(
      this.slugs,
      this.selectedSlug,
      direction,
    );
    if (slug !== null) {
      this.select(slug);
    }
  }

  private render(slug: string, revealTray: boolean): void {
    const product = this.productsBySlug.get(slug);
    if (!product) {
      return;
    }
    this.selectedSlug = slug;
    renderExplorerSelection({
      elements: this.elements,
      product,
      revealTray,
    });
    const requested = requestedProductFromUrl(
      this.windowValue.location.href,
      this.slugSet,
    );
    updateLocaleProductLinks(this.documentRoot, this.windowValue, requested);
  }
}

export function createProductExplorer(
  documentRoot: Document,
  options: ProductExplorerOptions = {},
): ProductExplorerController {
  const elements = collectExplorerElements(documentRoot);
  if (!elements) {
    return inertController();
  }
  const products = explorerProducts(elements);
  const windowValue = options.windowValue ?? window;
  const requested = requestedProductFromUrl(
    windowValue.location.href,
    new Set(products.map((product) => product.slug)),
  );
  const initialSlug = resolveInitialProduct(
    products.map((product) => product.slug),
    requested,
  );
  if (initialSlug === null) {
    return inertController();
  }
  const session = new ProductExplorerSession(
    documentRoot,
    windowValue,
    elements,
    products,
    initialSlug,
  );
  session.mount();
  return session;
}
