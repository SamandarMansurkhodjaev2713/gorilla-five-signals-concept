const PRODUCT_QUERY_KEY = "product";
const LOCALE_LINK_SELECTOR = "a[hreflang]";
export const PRODUCT_HISTORY_BRIDGE_EVENT = "gorilla:before-native-popstate";
export const PRODUCT_HISTORY_STATE_KEY = "gorilla:product-explorer";
const PRODUCT_HISTORY_STATE_VERSION = 1;

export type HistoryMode = "push" | "replace";

interface ProductHistoryEntry {
  readonly ownerPathname: string;
  readonly product: string;
  readonly version: typeof PRODUCT_HISTORY_STATE_VERSION;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProductHistoryEntry(value: unknown): value is ProductHistoryEntry {
  if (!isRecord(value)) return false;
  return (
    value.version === PRODUCT_HISTORY_STATE_VERSION &&
    typeof value.ownerPathname === "string" &&
    typeof value.product === "string"
  );
}

/** Add only our namespace while retaining every existing framework field. */
export function createProductHistoryState(
  currentState: unknown,
  product: string,
  ownerPathname: string,
): Readonly<Record<string, unknown>> {
  const preserved = isRecord(currentState) ? currentState : {};
  return {
    ...preserved,
    [PRODUCT_HISTORY_STATE_KEY]: {
      ownerPathname,
      product,
      version: PRODUCT_HISTORY_STATE_VERSION,
    } satisfies ProductHistoryEntry,
  };
}

/** Resolve only an entry owned by this controller and represented by the URL. */
export function ownedProductFromHistory(options: {
  readonly allowedSlugs: ReadonlySet<string>;
  readonly currentHref: string;
  readonly ownerPathname: string;
  readonly state: unknown;
}): string | null {
  if (!isRecord(options.state)) return null;
  const entry = options.state[PRODUCT_HISTORY_STATE_KEY];
  if (!isProductHistoryEntry(entry)) return null;
  const currentUrl = new URL(options.currentHref);
  if (
    entry.ownerPathname !== options.ownerPathname ||
    currentUrl.pathname !== options.ownerPathname
  ) {
    return null;
  }
  const requested = currentUrl.searchParams.get(PRODUCT_QUERY_KEY);
  return requested === entry.product && options.allowedSlugs.has(entry.product)
    ? entry.product
    : null;
}

export function requestedProductFromUrl(
  href: string,
  allowedSlugs: ReadonlySet<string>,
): string | null {
  const requested = new URL(href).searchParams.get(PRODUCT_QUERY_KEY);
  return requested !== null && allowedSlugs.has(requested) ? requested : null;
}

export function updateProductUrl(
  windowValue: Window,
  slug: string,
  mode: HistoryMode,
): void {
  const url = new URL(windowValue.location.href);
  url.searchParams.set(PRODUCT_QUERY_KEY, slug);
  const state = createProductHistoryState(
    windowValue.history.state,
    slug,
    url.pathname,
  );
  if (mode === "push") {
    windowValue.history.pushState(state, "", url);
    return;
  }
  windowValue.history.replaceState(state, "", url);
}

export function updateLocaleProductLinks(
  documentRoot: Document,
  windowValue: Window,
  selectedSlug: string | null,
): void {
  const links =
    documentRoot.querySelectorAll<HTMLAnchorElement>(LOCALE_LINK_SELECTOR);
  for (const link of links) {
    const url = new URL(link.href, windowValue.location.origin);
    if (url.origin !== windowValue.location.origin) {
      continue;
    }
    if (selectedSlug === null) {
      url.searchParams.delete(PRODUCT_QUERY_KEY);
    } else {
      url.searchParams.set(PRODUCT_QUERY_KEY, selectedSlug);
    }
    link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
  }
}

export function synchronizeLocaleProductLinks(
  documentRoot: Document,
  windowValue: Window,
): void {
  const currentUrl = new URL(windowValue.location.href);
  updateLocaleProductLinks(
    documentRoot,
    windowValue,
    currentUrl.searchParams.get(PRODUCT_QUERY_KEY),
  );
}
