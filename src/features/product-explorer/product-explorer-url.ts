const PRODUCT_QUERY_KEY = "product";
const LOCALE_LINK_SELECTOR = "a[hreflang]";

export type HistoryMode = "push" | "replace";

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
  const state = { product: slug };
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
