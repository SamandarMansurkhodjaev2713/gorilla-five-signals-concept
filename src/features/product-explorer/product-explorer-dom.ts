const EXPLORER_SELECTOR = "[data-product-explorer]";
export const PRODUCT_SELECTOR = "[data-product-selector]";
const CARD_SELECTOR = "[data-product-card]";
const PREVIOUS_SELECTOR = "[data-product-previous]";
const NEXT_SELECTOR = "[data-product-next]";
const TRAY_SELECTOR = "[data-comparison-tray]";
const TRAY_NAME_SELECTOR = "[data-comparison-name]";
const COMPARE_LINK_SELECTOR = "[data-comparison-link]";

export interface ExplorerElements {
  readonly cards: readonly HTMLElement[];
  readonly compareLink: HTMLAnchorElement;
  readonly nextButton: HTMLButtonElement;
  readonly previousButton: HTMLButtonElement;
  readonly root: HTMLElement;
  readonly selectors: readonly HTMLButtonElement[];
  readonly tray: HTMLElement;
  readonly trayName: HTMLElement;
}

export interface ExplorerProduct {
  readonly name: string;
  readonly slug: string;
}

export function collectExplorerElements(
  documentRoot: Document,
): ExplorerElements | null {
  const root = documentRoot.querySelector<HTMLElement>(EXPLORER_SELECTOR);
  if (!root) {
    return null;
  }
  const selectors = [
    ...root.querySelectorAll<HTMLButtonElement>(PRODUCT_SELECTOR),
  ];
  const cards = [...root.querySelectorAll<HTMLElement>(CARD_SELECTOR)];
  const previousButton =
    root.querySelector<HTMLButtonElement>(PREVIOUS_SELECTOR);
  const nextButton = root.querySelector<HTMLButtonElement>(NEXT_SELECTOR);
  const tray = root.querySelector<HTMLElement>(TRAY_SELECTOR);
  const trayName = root.querySelector<HTMLElement>(TRAY_NAME_SELECTOR);
  const compareLink = root.querySelector<HTMLAnchorElement>(
    COMPARE_LINK_SELECTOR,
  );
  if (
    selectors.length === 0 ||
    cards.length !== selectors.length ||
    !previousButton ||
    !nextButton ||
    !tray ||
    !trayName ||
    !compareLink
  ) {
    return null;
  }
  return {
    cards,
    compareLink,
    nextButton,
    previousButton,
    root,
    selectors,
    tray,
    trayName,
  };
}

export function explorerProducts(
  elements: ExplorerElements,
): readonly ExplorerProduct[] {
  return elements.cards.flatMap((card) => {
    const slug = card.dataset.productCard;
    const name = card.dataset.productName;
    return slug && name ? [{ name, slug }] : [];
  });
}

function renderSelectors(
  selectors: readonly HTMLButtonElement[],
  slug: string,
): void {
  for (const selector of selectors) {
    const selected = selector.dataset.productSelector === slug;
    selector.setAttribute("aria-pressed", String(selected));
  }
}

function renderCards(cards: readonly HTMLElement[], slug: string): void {
  for (const card of cards) {
    if (card.dataset.productCard === slug) {
      card.setAttribute("data-motion-selected", "");
    } else {
      card.removeAttribute("data-motion-selected");
    }
  }
}

export function renderExplorerSelection(options: {
  readonly elements: ExplorerElements;
  readonly product: ExplorerProduct;
  readonly revealTray: boolean;
}): void {
  const { elements, product } = options;
  elements.root.dataset.enhanced = "true";
  elements.root.dataset.selectedProduct = product.slug;
  renderSelectors(elements.selectors, product.slug);
  renderCards(elements.cards, product.slug);
  elements.trayName.textContent = product.name;
  elements.compareLink.href = `${elements.compareLink.pathname}?products=${encodeURIComponent(product.slug)}`;
  elements.tray.hidden = !options.revealTray;
  elements.root.dispatchEvent(
    new CustomEvent("gorilla:selection-change", {
      bubbles: true,
      detail: { slug: product.slug },
    }),
  );
}
